<template>
  <div class="pro-table">
    <!-- Toolbar -->
    <div v-if="toolbar" class="pro-table-toolbar">
      <div class="toolbar-left">
        <h3 v-if="toolbar.title" class="toolbar-title">{{ toolbar.title }}</h3>
        <p v-if="toolbar.subTitle" class="toolbar-subtitle">{{ toolbar.subTitle }}</p>
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-actions"></slot>
        <a-space>
          <a-tooltip v-if="toolbar.actions?.includes('refresh')" title="刷新">
            <a-button @click="handleRefresh">
              <ReloadOutlined />
            </a-button>
          </a-tooltip>
          <a-tooltip v-if="toolbar.actions?.includes('columnSetting')" title="列设置">
            <a-button @click="columnSettingVisible = true">
              <SettingOutlined />
            </a-button>
          </a-tooltip>
        </a-space>
      </div>
    </div>

    <!-- Search Form -->
    <div v-if="searchColumns.length > 0" class="pro-table-search">
      <a-form
        :model="searchForm"
        :label-col="{ span: search?.labelWidth || 6 }"
        class="search-form"
      >
        <a-row :gutter="16">
          <a-col
            v-for="col in visibleSearchColumns"
            :key="col.dataIndex"
            :xs="24"
            :sm="12"
            :lg="8"
          >
            <a-form-item :label="col.title" :name="col.dataIndex">
              <!-- Input -->
              <a-input
                v-if="col.searchType === 'input'"
                v-model:value="searchForm[col.dataIndex]"
                :placeholder="`请输入${col.title}`"
                v-bind="col.searchProps"
              />

              <!-- Select -->
              <a-select
                v-else-if="col.searchType === 'select'"
                v-model:value="searchForm[col.dataIndex]"
                :placeholder="`请选择${col.title}`"
                :options="col.searchOptions"
                v-bind="col.searchProps"
              />

              <!-- Date Picker -->
              <a-date-picker
                v-else-if="col.searchType === 'datePicker'"
                v-model:value="searchForm[col.dataIndex]"
                :placeholder="`请选择${col.title}`"
                style="width: 100%"
                v-bind="col.searchProps"
              />

              <!-- Date Range -->
              <a-range-picker
                v-else-if="col.searchType === 'dateRange'"
                v-model:value="searchForm[col.dataIndex]"
                style="width: 100%"
                v-bind="col.searchProps"
              />
            </a-form-item>
          </a-col>

          <!-- Search Actions -->
          <a-col :xs="24" :sm="12" :lg="8" class="search-actions">
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleSearch">
                  <SearchOutlined /> 查询
                </a-button>
                <a-button @click="handleReset">
                  <ReloadOutlined /> 重置
                </a-button>
                <a-button
                  v-if="searchColumns.length > 3"
                  type="link"
                  @click="searchCollapsed = !searchCollapsed"
                >
                  {{ searchCollapsed ? '展开' : '收起' }}
                  <DownOutlined :class="{ 'rotate-180': !searchCollapsed }" />
                </a-button>
              </a-space>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- Table -->
    <a-table
      :columns="displayColumns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="paginationConfig"
      size="middle"
      :row-key="rowKey"
      v-bind="$attrs"
      @change="handleTableChange"
    >
      <!-- Custom column rendering -->
      <template
        v-for="col in displayColumns"
        :key="col.dataIndex"
        #[`bodyCell`]="{ column, record, text, index }"
      >
        <template v-if="column.dataIndex === 'action'">
          <a-space class="row-action-group" :size="4">
            <template v-for="(action, idx) in column.actions" :key="idx">
              <a-button
                v-if="!action.hidden?.(record)"
                :type="action.type || 'link'"
                :danger="action.danger"
                :disabled="action.disabled?.(record)"
                size="small"
                class="table-action-btn"
                @click="handleAction(action, record)"
              >
                <component :is="action.icon" v-if="action.icon" />
                {{ action.label }}
              </a-button>
            </template>
          </a-space>
        </template>

        <template v-else-if="column.valueType">
          <ValueTypeRender
            :value="text"
            :type="column.valueType"
            :enum="column.valueEnum"
            :record="record"
          />
        </template>
      </template>
    </a-table>

    <!-- Column Setting Modal -->
    <a-modal
      v-model:open="columnSettingVisible"
      title="列设置"
      @ok="columnSettingVisible = false"
    >
      <a-checkbox-group v-model:value="checkedColumns" style="width: 100%">
        <a-row>
          <a-col
            v-for="col in settableColumns"
            :key="col.dataIndex"
            :span="24"
            style="margin-bottom: 8px"
          >
            <a-checkbox :value="col.dataIndex">{{ col.title }}</a-checkbox>
          </a-col>
        </a-row>
      </a-checkbox-group>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  ReloadOutlined,
  SettingOutlined,
  SearchOutlined,
  DownOutlined
} from '@antdv-next/icons'
import { message, Modal } from 'antdv-next'
import type { ProTableColumn } from '@/types/pro'
import ValueTypeRender from './ValueTypeRender.vue'

interface Props {
  columns: ProTableColumn[]
  request: (params: any) => Promise<{ data: any[]; total?: number; success: boolean }>
  toolbar?: {
    title?: string
    subTitle?: string
    actions?: string[]
  }
  search?: {
    labelWidth?: number
    defaultCollapsed?: boolean
  }
  pagination?: any
  rowKey?: string | ((record: any) => string)
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id',
  pagination: () => ({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条`
  })
})

const emit = defineEmits(['refresh'])

// State
const dataSource = ref<any[]>([])
const loading = ref(false)
const searchForm = ref<Record<string, any>>({})
const searchCollapsed = ref(props.search?.defaultCollapsed ?? true)
const columnSettingVisible = ref(false)
const checkedColumns = ref<string[]>([])
const currentPage = ref(1)
const pageSize = ref(props.pagination.pageSize || 10)
const total = ref(0)

// Computed
const searchColumns = computed(() => {
  return props.columns.filter(col => col.search)
})

const visibleSearchColumns = computed(() => {
  if (searchCollapsed.value && searchColumns.value.length > 3) {
    return searchColumns.value.slice(0, 3)
  }
  return searchColumns.value
})

const settableColumns = computed(() => {
  return props.columns.filter(col => col.dataIndex !== 'action')
})

const displayColumns = computed(() => {
  if (checkedColumns.value.length === 0) {
    return props.columns
  }
  return props.columns.filter(
    col => checkedColumns.value.includes(col.dataIndex) || col.dataIndex === 'action'
  )
})

const paginationConfig = computed(() => ({
  ...props.pagination,
  current: currentPage.value,
  pageSize: pageSize.value,
  total: total.value
}))

// Methods
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      current: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
    }

    const result = await props.request(params)

    if (result.success) {
      dataSource.value = result.data
      total.value = result.total || result.data.length
    }
  } catch (error: any) {
    message.error(error.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleReset = () => {
  searchForm.value = {}
  currentPage.value = 1
  loadData()
}

const handleRefresh = () => {
  loadData()
  emit('refresh')
}

const handleTableChange = (pagination: any) => {
  currentPage.value = pagination.current
  pageSize.value = pagination.pageSize
  loadData()
}

const handleAction = async (action: any, record: any) => {
  if (action.confirm) {
    Modal.confirm({
      title: '确认',
      content: action.confirm,
      onOk: async () => {
        await action.onClick?.(record)
        loadData()
      }
    })
  } else {
    await action.onClick?.(record)
    loadData()
  }
}

// Initialize
onMounted(() => {
  checkedColumns.value = settableColumns.value.map(col => col.dataIndex)
  loadData()
})

// Expose methods
defineExpose({
  refresh: loadData,
  reload: () => {
    currentPage.value = 1
    loadData()
  }
})
</script>

<style scoped lang="scss">
.pro-table {
  background: var(--color-bg-container);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-secondary);
  padding: var(--spacing-md);

  .pro-table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--color-border-secondary);

    .toolbar-left {
      .toolbar-title {
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
      }

      .toolbar-subtitle {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }
  }

  .pro-table-search {
    margin-bottom: var(--spacing-md);
    padding: 4px 8px 2px;
    border-bottom: 1px solid var(--color-border-secondary);

    .search-actions {
      display: flex;
      align-items: flex-end;
    }

    .rotate-180 {
      transform: rotate(180deg);
      transition: transform var(--duration-base);
    }
  }

  :deep(.ant-table-container) {
    border: 1px solid var(--color-border-secondary);
    border-radius: 12px;
    overflow: hidden;
  }

  :deep(.ant-table-thead > tr > th) {
    background: linear-gradient(180deg, rgba(24, 119, 255, 0.08), rgba(24, 119, 255, 0.02));
    color: var(--color-text-secondary);
    font-size: 12px;
    font-weight: var(--font-weight-semibold);
    border-bottom: 1px solid var(--color-border);
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background: var(--color-bg-layout) !important;
  }

  .row-action-group {
    opacity: 0;
    transform: translateX(6px);
    transition: all var(--duration-base) var(--ease-out);
  }

  :deep(.ant-table-row:hover) .row-action-group {
    opacity: 1;
    transform: translateX(0);
  }

  .table-action-btn {
    border-radius: 8px;
    padding-inline: 8px;

    :deep(.anticon) {
      margin-right: 2px;
    }
  }
}

@media (max-width: 992px) {
  .pro-table {
    .row-action-group {
      opacity: 1;
      transform: none;
    }
  }
}
</style>
