<template>
  <div
    ref="proTableRef"
    class="pro-table"
    :style="tableRootStyle"
  >
    <!-- Toolbar -->
    <div v-if="toolbar" ref="toolbarRef" class="pro-table-toolbar">
      <div class="toolbar-left">
        <span v-if="toolbar.title" class="toolbar-title">{{ toolbar.title }}</span>
        <span v-if="toolbar.subTitle" class="toolbar-subtitle">{{ toolbar.subTitle }}</span>
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-actions"></slot>
        <a-space :size="4">
          <a-tooltip v-if="showRefreshAction" title="刷新">
            <a-button type="text" class="toolbar-icon-btn" @click="handleRefresh">
              <ReloadOutlined />
            </a-button>
          </a-tooltip>

          <a-dropdown
            v-if="showDensityAction"
            placement="bottomRight"
            :menu="densityMenuProps"
            :trigger="['click']"
          >
            <a-tooltip title="表格密度">
              <a-button type="text" class="toolbar-icon-btn">
                <ColumnHeightOutlined />
              </a-button>
            </a-tooltip>
          </a-dropdown>

          <a-popover
            v-if="showColumnSettingAction"
            trigger="click"
            placement="bottomRight"
          >
            <template #content>
              <div class="column-setting-dropdown" @click.stop>
                <div class="setting-actions">
                  <a-button size="small" type="link" @click.stop="handleToggleAllColumns">
                    全部勾选
                  </a-button>
                  <a-button size="small" type="link" @click.stop="toggleIndexColumn">
                    序列列勾选
                  </a-button>
                  <a-button size="small" type="link" @click.stop="handleResetColumns">
                    重置
                  </a-button>
                </div>

                <div class="setting-list">
                  <div
                    v-for="state in columnStates"
                    :key="state.key"
                    class="setting-item"
                    :class="{ dragging: draggingColumnKey === state.key }"
                    draggable="true"
                    @dragstart="handleDragStart(state.key)"
                    @dragend="handleDragEnd"
                    @dragover.prevent
                    @drop.prevent="handleDrop(state.key)"
                  >
                    <div class="setting-item-left">
                      <span class="drag-handle">::</span>
                      <a-checkbox
                        :checked="state.checked"
                        @change="handleColumnCheckedChange(state.key, $event)"
                      >
                        {{ state.title }}
                      </a-checkbox>
                    </div>
                    <div class="setting-item-right">
                      <a-tooltip title="左固定">
                        <a-button
                          type="text"
                          size="small"
                          class="fixed-btn"
                          :class="{ active: state.fixed === 'left' }"
                          @click.stop="toggleColumnFixed(state.key, 'left')"
                        >
                          <VerticalLeftOutlined />
                        </a-button>
                      </a-tooltip>
                      <a-tooltip title="右固定">
                        <a-button
                          type="text"
                          size="small"
                          class="fixed-btn"
                          :class="{ active: state.fixed === 'right' }"
                          @click.stop="toggleColumnFixed(state.key, 'right')"
                        >
                          <VerticalRightOutlined />
                        </a-button>
                      </a-tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <a-button type="text" class="toolbar-icon-btn">
              <SettingOutlined />
            </a-button>
          </a-popover>
        </a-space>
      </div>
    </div>

    <!-- Search Form -->
    <div v-if="showSearchForm" ref="searchRef" class="pro-table-search">
      <a-form
        :model="searchForm"
        :label-col="{ span: searchLabelWidth }"
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
              <a-input
                v-if="col.searchType === 'input'"
                v-model:value="searchForm[col.dataIndex]"
                :placeholder="`请输入${col.title}`"
                v-bind="col.searchProps"
              />

              <a-select
                v-else-if="col.searchType === 'select'"
                v-model:value="searchForm[col.dataIndex]"
                :placeholder="`请选择${col.title}`"
                :options="col.searchOptions"
                v-bind="col.searchProps"
              />

              <a-date-picker
                v-else-if="col.searchType === 'datePicker'"
                v-model:value="searchForm[col.dataIndex]"
                :placeholder="`请选择${col.title}`"
                style="width: 100%"
                v-bind="col.searchProps"
              />

              <a-range-picker
                v-else-if="col.searchType === 'dateRange'"
                v-model:value="searchForm[col.dataIndex]"
                style="width: 100%"
                v-bind="col.searchProps"
              />
            </a-form-item>
          </a-col>

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
    <div
      ref="tableSectionRef"
      class="pro-table-main"
      :class="{ 'main-scroll-mode': !effectiveFixedHeader && !isAutoHeight }"
    >
      <a-table
        :columns="displayColumns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="paginationConfig"
        :size="tableSize"
        :row-key="rowKey"
        :bordered="effectiveBordered"
        :sticky="effectiveFixedHeader"
        :scroll="tableScroll"
        v-bind="$attrs"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record, text, index }">
          <template v-if="column.dataIndex === '__index'">
            {{ getRowIndex(index) }}
          </template>

          <template v-else-if="column.dataIndex === 'action'">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, h } from 'vue'
import {
  ReloadOutlined,
  SettingOutlined,
  SearchOutlined,
  DownOutlined,
  ColumnHeightOutlined,
  CheckOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined
} from '@antdv-next/icons'
import { message, Modal } from 'antdv-next'
import ValueTypeRender from './ValueTypeRender.vue'
import { appDefaultSettings } from '@/settings'
import type {
  ProTableColumn,
  ProTableToolbar,
  ProTableSearch,
  ProTablePagination,
  ProTableRequest,
  ProTableAction
} from '@/types/pro'
import type { ProTableDensity, ProTableHeight } from '@/settings'

interface Props {
  columns: ProTableColumn[]
  request: ProTableRequest
  toolbar?: ProTableToolbar
  search?: ProTableSearch | false
  pagination?: ProTablePagination | false
  rowKey?: string | ((record: any) => string)
  size?: ProTableDensity
  height?: ProTableHeight
  resizable?: boolean
  ellipsis?: boolean
  bordered?: boolean
  fixedHeader?: boolean
}

interface ColumnState {
  key: string
  title: string
  checked: boolean
  fixed?: 'left' | 'right'
  defaultChecked: boolean
  defaultFixed?: 'left' | 'right'
  column: ProTableColumn
}

type TableSize = 'large' | 'middle' | 'small'

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id',
  size: appDefaultSettings.proTable.size,
  height: appDefaultSettings.proTable.height,
  resizable: appDefaultSettings.proTable.resizable,
  ellipsis: appDefaultSettings.proTable.ellipsis,
  bordered: appDefaultSettings.proTable.bordered,
  fixedHeader: appDefaultSettings.proTable.fixedHeader,
  pagination: () => ({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条`
  })
})

const emit = defineEmits(['refresh'])

const normalizeDensity = (size: ProTableDensity | undefined): TableSize => {
  if (size === 'large' || size === 'middle' || size === 'small') {
    return size
  }
  return 'small'
}

const cloneColumnState = (state: ColumnState): ColumnState => ({
  ...state,
  column: { ...state.column }
})

const resolveColumnKey = (column: ProTableColumn, index: number) => {
  return String(column.key ?? column.dataIndex ?? `col_${index}`)
}

// Refs
const proTableRef = ref<HTMLElement>()
const toolbarRef = ref<HTMLElement>()
const searchRef = ref<HTMLElement>()
const tableSectionRef = ref<HTMLElement>()

// State
const dataSource = ref<any[]>([])
const loading = ref(false)
const searchForm = ref<Record<string, any>>({})
const searchCollapsed = ref(props.search !== false ? (props.search?.defaultCollapsed ?? true) : true)
const currentPage = ref(props.pagination !== false ? (props.pagination?.current || 1) : 1)
const pageSize = ref(props.pagination !== false ? (props.pagination?.pageSize || 10) : 10)
const total = ref(0)
const tableSize = ref<TableSize>(normalizeDensity(props.size))
const tableScrollY = ref<number>()

const showIndexColumn = ref(true)
const defaultShowIndexColumn = ref(true)
const columnStates = ref<ColumnState[]>([])
const defaultColumnStates = ref<ColumnState[]>([])
const draggingColumnKey = ref('')

// Computed
const toolbarActions = computed(() => props.toolbar?.actions || [])

const showRefreshAction = computed(() => {
  if (!props.toolbar) return false
  return toolbarActions.value.length === 0 || toolbarActions.value.includes('refresh')
})

const showColumnSettingAction = computed(() => {
  if (!props.toolbar) return false
  return toolbarActions.value.length === 0 || toolbarActions.value.includes('columnSetting')
})

const showDensityAction = computed(() => {
  if (!props.toolbar) return false
  return (
    toolbarActions.value.length === 0 ||
    toolbarActions.value.includes('density') ||
    (showRefreshAction.value && showColumnSettingAction.value)
  )
})

const effectiveResizable = computed(() => {
  return props.resizable ?? appDefaultSettings.proTable.resizable
})

const effectiveEllipsis = computed(() => {
  return props.ellipsis ?? appDefaultSettings.proTable.ellipsis
})

const effectiveBordered = computed(() => {
  return props.bordered ?? appDefaultSettings.proTable.bordered
})

const effectiveFixedHeader = computed(() => {
  return props.fixedHeader ?? appDefaultSettings.proTable.fixedHeader
})

const effectiveHeight = computed(() => {
  return props.height ?? appDefaultSettings.proTable.height
})

const isAutoHeight = computed(() => {
  return String(effectiveHeight.value) === 'auto'
})

const tableRootStyle = computed<Record<string, string> | undefined>(() => {
  if (isAutoHeight.value) {
    return undefined
  }

  const height = typeof effectiveHeight.value === 'number'
    ? `${effectiveHeight.value}px`
    : String(effectiveHeight.value)

  return { height }
})

const searchColumns = computed(() => {
  return props.columns.filter(col => col.search)
})

const showSearchForm = computed(() => {
  return props.search !== false && searchColumns.value.length > 0
})

const searchLabelWidth = computed(() => {
  if (props.search === false) return 6
  return props.search?.labelWidth || 6
})

const visibleSearchColumns = computed(() => {
  if (searchCollapsed.value && searchColumns.value.length > 3) {
    return searchColumns.value.slice(0, 3)
  }
  return searchColumns.value
})

const paginationEnabled = computed(() => {
  return props.pagination !== false
})

const paginationConfig = computed(() => {
  if (!paginationEnabled.value) {
    return false
  }

  return {
    current: currentPage.value,
    pageSize: pageSize.value,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (value: number) => `共 ${value} 条`,
    ...props.pagination,
    total: total.value
  }
})

const displayColumns = computed<ProTableColumn[]>(() => {
  const columns = columnStates.value
    .filter(state => state.checked)
    .map(state => ({
      ...state.column,
      key: state.column.key || state.key,
      fixed: state.fixed,
      ellipsis: state.column.ellipsis ?? effectiveEllipsis.value,
      resizable: state.column.resizable ?? effectiveResizable.value
    }))

  if (!showIndexColumn.value) {
    return columns
  }

  return [
    {
      title: '#',
      dataIndex: '__index',
      key: '__index',
      width: 64,
      align: 'center',
      fixed: 'left',
      ellipsis: false
    },
    ...columns
  ]
})

const hasFixedColumns = computed(() => {
  return displayColumns.value.some(col => Boolean(col.fixed))
})

const tableScroll = computed(() => {
  const scroll: Record<string, any> = {}

  if (hasFixedColumns.value) {
    scroll.x = 'max-content'
  }

  if (!isAutoHeight.value && effectiveFixedHeader.value && tableScrollY.value) {
    scroll.y = tableScrollY.value
  }

  return Object.keys(scroll).length > 0 ? scroll : undefined
})

const densityMenuProps = computed(() => ({
  items: [
    {
      key: 'large',
      label: '宽松',
      icon: tableSize.value === 'large' ? h(CheckOutlined) : undefined
    },
    {
      key: 'middle',
      label: '默认',
      icon: tableSize.value === 'middle' ? h(CheckOutlined) : undefined
    },
    {
      key: 'small',
      label: '紧凑',
      icon: tableSize.value === 'small' ? h(CheckOutlined) : undefined
    }
  ],
  onClick: ({ key }: { key: string | number }) => {
    tableSize.value = normalizeDensity(String(key) as ProTableDensity)
    scheduleMeasureTable()
  }
}))

// Methods
const initializeColumnStates = () => {
  const states = props.columns.map((column, index) => {
    const key = resolveColumnKey(column, index)
    const checked = !column.hideInTable
    return {
      key,
      title: String(column.title ?? column.dataIndex ?? key),
      checked,
      fixed: column.fixed,
      defaultChecked: checked,
      defaultFixed: column.fixed,
      column: {
        ...column,
        key: column.key || key
      }
    } as ColumnState
  })

  columnStates.value = states
  defaultColumnStates.value = states.map(cloneColumnState)
  showIndexColumn.value = defaultShowIndexColumn.value
}

const getRowIndex = (index: number) => {
  if (!paginationEnabled.value) {
    return index + 1
  }
  return (currentPage.value - 1) * pageSize.value + index + 1
}

const toggleColumnChecked = (key: string, checked: boolean) => {
  const item = columnStates.value.find(state => state.key === key)
  if (!item) return

  item.checked = checked
  scheduleMeasureTable()
}

const handleColumnCheckedChange = (key: string, event: any) => {
  toggleColumnChecked(key, Boolean(event?.target?.checked))
}

const toggleColumnFixed = (key: string, position: 'left' | 'right') => {
  const item = columnStates.value.find(state => state.key === key)
  if (!item) return

  item.fixed = item.fixed === position ? undefined : position
  scheduleMeasureTable()
}

const handleToggleAllColumns = () => {
  const allChecked = columnStates.value.length > 0 && columnStates.value.every(item => item.checked)
  if (allChecked) {
    columnStates.value.forEach(item => {
      item.checked = !item.checked
    })
  } else {
    columnStates.value.forEach(item => {
      item.checked = true
    })
  }
  scheduleMeasureTable()
}

const toggleIndexColumn = () => {
  showIndexColumn.value = !showIndexColumn.value
  scheduleMeasureTable()
}

const handleResetColumns = () => {
  columnStates.value = defaultColumnStates.value.map(cloneColumnState)
  showIndexColumn.value = defaultShowIndexColumn.value
  scheduleMeasureTable()
}

const handleDragStart = (key: string) => {
  draggingColumnKey.value = key
}

const handleDragEnd = () => {
  draggingColumnKey.value = ''
}

const handleDrop = (targetKey: string) => {
  const sourceKey = draggingColumnKey.value
  if (!sourceKey || sourceKey === targetKey) return

  const sourceIndex = columnStates.value.findIndex(item => item.key === sourceKey)
  const targetIndex = columnStates.value.findIndex(item => item.key === targetKey)
  if (sourceIndex === -1 || targetIndex === -1) return

  const list = [...columnStates.value]
  const [dragItem] = list.splice(sourceIndex, 1)
  list.splice(targetIndex, 0, dragItem)
  columnStates.value = list
  draggingColumnKey.value = ''
  scheduleMeasureTable()
}

const loadData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      ...searchForm.value
    }

    if (paginationEnabled.value) {
      params.current = currentPage.value
      params.pageSize = pageSize.value
    }

    const result = await props.request(params)

    if (result.success) {
      dataSource.value = result.data
      total.value = result.total || result.data.length
      scheduleMeasureTable()
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
  if (paginationEnabled.value) {
    currentPage.value = pagination.current
    pageSize.value = pagination.pageSize
  }
  loadData()
}

const handleAction = async (action: ProTableAction, record: any) => {
  if (action.confirm) {
    Modal.confirm({
      title: '确认',
      content: action.confirm,
      onOk: async () => {
        await action.onClick?.(record)
        loadData()
      }
    })
    return
  }

  await action.onClick?.(record)
  loadData()
}

const getOuterHeight = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect()
  const style = window.getComputedStyle(el)
  return (
    rect.height +
    Number.parseFloat(style.marginTop || '0') +
    Number.parseFloat(style.marginBottom || '0')
  )
}

const getHeaderFallbackHeight = () => {
  if (tableSize.value === 'large') return 54
  if (tableSize.value === 'small') return 40
  return 48
}

const measureTableScroll = () => {
  if (isAutoHeight.value || !effectiveFixedHeader.value) {
    tableScrollY.value = undefined
    return
  }

  const section = tableSectionRef.value
  if (!section) return

  const sectionHeight = section.clientHeight
  if (!sectionHeight) return

  const paginationEl = section.querySelector('.ant-pagination') as HTMLElement | null
  const paginationHeight = paginationEl ? getOuterHeight(paginationEl) : 0

  const headerEl = section.querySelector('.ant-table-header') as HTMLElement | null
  const theadEl = section.querySelector('.ant-table-thead') as HTMLElement | null
  const headerHeight = headerEl
    ? headerEl.getBoundingClientRect().height
    : (theadEl?.getBoundingClientRect().height || getHeaderFallbackHeight())

  const nextY = Math.max(120, Math.floor(sectionHeight - paginationHeight - headerHeight - 2))
  if (!tableScrollY.value || Math.abs(nextY - tableScrollY.value) > 1) {
    tableScrollY.value = nextY
  }
}

let rafId = 0
let resizeObserver: ResizeObserver | null = null

const scheduleMeasureTable = () => {
  if (rafId) {
    cancelAnimationFrame(rafId)
  }
  rafId = requestAnimationFrame(() => {
    rafId = 0
    nextTick(() => {
      measureTableScroll()
    })
  })
}

// Lifecycle
onMounted(() => {
  initializeColumnStates()
  loadData()

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      scheduleMeasureTable()
    })

    if (proTableRef.value) resizeObserver.observe(proTableRef.value)
    if (toolbarRef.value) resizeObserver.observe(toolbarRef.value)
    if (searchRef.value) resizeObserver.observe(searchRef.value)
    if (tableSectionRef.value) resizeObserver.observe(tableSectionRef.value)
  }

  scheduleMeasureTable()
})

onBeforeUnmount(() => {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(
  () => props.columns,
  () => {
    initializeColumnStates()
    scheduleMeasureTable()
  },
  { deep: true }
)

watch(
  () => props.size,
  (value) => {
    tableSize.value = normalizeDensity(value)
    scheduleMeasureTable()
  }
)

watch(
  () => props.height,
  () => {
    scheduleMeasureTable()
  }
)

watch(
  () => props.search,
  (value) => {
    if (value !== false) {
      searchCollapsed.value = value?.defaultCollapsed ?? true
      nextTick(() => {
        if (resizeObserver && searchRef.value) {
          resizeObserver.observe(searchRef.value)
        }
      })
    }
    scheduleMeasureTable()
  },
  { deep: true }
)

watch(
  [searchCollapsed, dataSource, total, currentPage, pageSize, displayColumns],
  () => {
    scheduleMeasureTable()
  },
  { deep: true }
)

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
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--color-bg-container);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-secondary);
  overflow: hidden;

  .pro-table-toolbar {
    height: 32px;
    min-height: 32px;
    padding: 0 8px;
    border-bottom: 1px solid var(--color-border-secondary);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;

    .toolbar-left {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toolbar-title {
      font-size: 13px;
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      white-space: nowrap;
    }

    .toolbar-subtitle {
      font-size: 12px;
      color: var(--color-text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .toolbar-icon-btn {
      width: 28px;
      height: 28px;
      padding: 0;
      border-radius: 6px;
      color: var(--color-text-secondary);

      &:hover {
        color: var(--color-text-primary);
        background: var(--color-bg-layout);
      }
    }
  }

  .pro-table-search {
    padding: 8px 12px 0;
    border-bottom: 1px solid var(--color-border-secondary);
    flex-shrink: 0;

    .search-actions {
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
    }

    .rotate-180 {
      transform: rotate(180deg);
      transition: transform var(--duration-base);
    }
  }

  .pro-table-main {
    flex: 1;
    min-height: 0;
    padding: 8px;
    overflow: hidden;

    &.main-scroll-mode {
      overflow: auto;
    }
  }

  :deep(.ant-table-container) {
    border-radius: 10px;
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
    opacity: 1;
    transform: none;
  }

  .table-action-btn {
    border-radius: 8px;
    padding-inline: 8px;

    :deep(.anticon) {
      margin-right: 2px;
    }
  }
}

.column-setting-dropdown {
  width: 320px;
  max-height: 420px;
  background: var(--color-bg-container);
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  box-shadow: var(--shadow-2);
  overflow: hidden;

  .setting-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--color-border-secondary);
  }

  .setting-list {
    max-height: 360px;
    overflow: auto;
    padding: 6px 0;
  }

  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 4px 8px;
    cursor: move;
    transition: background var(--duration-base) var(--ease-out);

    &:hover {
      background: var(--color-bg-layout);
    }

    &.dragging {
      opacity: 0.55;
    }
  }

  .setting-item-left {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    overflow: hidden;
  }

  .drag-handle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    color: var(--color-text-tertiary);
    font-size: 12px;
    letter-spacing: -1px;
    user-select: none;
  }

  .setting-item-right {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }

  .fixed-btn {
    width: 24px;
    height: 24px;
    padding: 0;
    color: var(--color-text-tertiary);

    &.active {
      color: var(--color-primary);
      background: var(--color-primary-1);
      border-radius: 4px;
    }
  }
}
</style>
