<template>
  <div class="page-container">
    <div class="config-container">
      <!-- groups nav -->
      <div class="config-groups">
        <div class="config-groups-header">
          <h3>{{ $t('config.configGroups') }}</h3>
        </div>
        <div class="config-groups-list">
          <div
            v-for="group in groups"
            :key="group"
            class="config-group-item"
            :class="{ active: selectedGroup === group }"
            @click="selectedGroup = group"
          >
            <span class="group-name">{{ $t(`config.groups.${group}`) }}</span>
            <span class="group-count">{{ getGroupCount(group) }}</span>
          </div>
        </div>
      </div>

      <!-- config list -->
      <div class="config-data">
        <ProTable
          :key="selectedGroup + refreshKey"
          :columns="columns"
          :request="loadConfigList"
          :search="false"
          :toolbar="{ title: $t(`config.groups.${selectedGroup}`) }"
        >
          <template #toolbar-actions>
            <a-button type="primary" @click="handleAdd">
              <PlusOutlined /> {{ $t('config.createConfig') }}
            </a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'value'">
              <template v-if="record.valueType === 'boolean'">
                <a-tag :color="record.value === 'true' ? 'green' : 'default'">
                  {{ record.value === 'true' ? $t('common.yes') : $t('common.no') }}
                </a-tag>
              </template>
              <template v-else>
                <span class="config-value">{{ record.value }}</span>
              </template>
            </template>
            <template v-if="column.key === 'valueType'">
              <a-tag>{{ $t(`config.valueTypes.${record.valueType}`) || record.valueType }}</a-tag>
            </template>
            <template v-if="column.key === 'builtIn'">
              <a-tag :color="record.builtIn ? 'blue' : 'default'">
                {{ record.builtIn ? $t('config.builtInTypes.builtIn') : $t('config.builtInTypes.custom') }}
              </a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-space :size="4">
                <a-button type="link" size="small" @click="handleEdit(record)">
                  <template #icon><EditOutlined /></template>
                  {{ $t('common.edit') }}
                </a-button>
                <a-button
                  v-if="!record.builtIn"
                  type="link"
                  size="small"
                  danger
                  @click="handleDelete(record)"
                >
                  <template #icon><DeleteOutlined /></template>
                  {{ $t('common.delete') }}
                </a-button>
              </a-space>
            </template>
          </template>
        </ProTable>
      </div>
    </div>

    <!-- add/edit modal -->
    <a-modal v-model:open="modalVisible" :title="modalTitle" @ok="handleSubmit" :width="520">
      <a-form :model="form" :label-col="{ span: 6 }" style="margin-top: 16px">
        <a-form-item :label="$t('config.configName')" required>
          <a-input v-model:value="form.name" :placeholder="$t('config.placeholders.configName')" />
        </a-form-item>
        <a-form-item :label="$t('config.configKey')" required>
          <a-input v-model:value="form.key" :placeholder="$t('config.placeholders.configKey')" :disabled="!!form.id" />
        </a-form-item>
        <a-form-item :label="$t('config.configValue')" required>
          <a-switch v-if="form.valueType === 'boolean'" v-model:checked="boolValue" />
          <a-input-number v-else-if="form.valueType === 'number'" v-model:value="form.value" style="width: 100%" />
          <a-textarea v-else-if="form.valueType === 'json'" v-model:value="form.value" :rows="4" :placeholder="$t('config.placeholders.jsonFormat')" />
          <a-input v-else v-model:value="form.value" :placeholder="$t('config.placeholders.configValue')" />
        </a-form-item>
        <a-form-item :label="$t('config.valueType')">
          <a-select v-model:value="form.valueType" :disabled="!!form.id">
            <a-select-option value="string">{{ $t('config.valueTypes.string') }}</a-select-option>
            <a-select-option value="number">{{ $t('config.valueTypes.number') }}</a-select-option>
            <a-select-option value="boolean">{{ $t('config.valueTypes.boolean') }}</a-select-option>
            <a-select-option value="json">{{ $t('config.valueTypes.json') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('config.group')">
          <a-select v-model:value="form.group" allow-clear>
            <a-select-option v-for="g in groups" :key="g" :value="g">{{ $t(`config.groups.${g}`) }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('config.sort')">
          <a-input-number v-model:value="form.sort" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item :label="$t('config.description')">
          <a-textarea v-model:value="form.description" :placeholder="$t('config.placeholders.description')" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message, Modal } from 'antdv-next'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@antdv-next/icons'
import { useI18n } from 'vue-i18n'
import ProTable from '@/components/Pro/ProTable/index.vue'
import type { ProTableColumn } from '@/types/pro'
import type { SysConfig } from '@/types/config'
import { getConfigList, createConfig, updateConfig, deleteConfig } from '@/api/config'

const { t } = useI18n()

const groups = ref<string[]>(['basic', 'security', 'upload', 'notification'])
const selectedGroup = ref('basic')
const allConfigs = ref<SysConfig[]>([])
const refreshKey = ref(0)

const getGroupCount = (group: string) => allConfigs.value.filter(c => c.group === group).length

// modal
const modalVisible = ref(false)
const modalTitle = computed(() => form.value.id ? t('config.editConfig') : t('config.createConfig'))
const form = ref<Partial<SysConfig>>({
  name: '', key: '', value: '', valueType: 'string', group: 'basic', sort: 0, description: ''
})
const boolValue = computed({
  get: () => form.value.value === 'true',
  set: (v: boolean) => { form.value.value = String(v) }
})

const columns: ProTableColumn[] = [
  { title: computed(() => t('config.configName')), dataIndex: 'name', key: 'name', width: 160 },
  { title: computed(() => t('config.configKey')), dataIndex: 'key', key: 'key', width: 200 },
  { title: computed(() => t('config.configValue')), dataIndex: 'value', key: 'value', ellipsis: true },
  { title: computed(() => t('config.valueType')), dataIndex: 'valueType', key: 'valueType', width: 90 },
  { title: computed(() => t('config.builtIn')), dataIndex: 'builtIn', key: 'builtIn', width: 90 },
  { title: computed(() => t('config.description')), dataIndex: 'description', key: 'description', ellipsis: true },
  { title: computed(() => t('common.actions')), key: 'action', width: 150, fixed: 'right' }
]

const loadConfigList = async (params: any) => {
  try {
    const response = await getConfigList({
      group: selectedGroup.value,
      page: params.current,
      pageSize: params.pageSize
    }) as any
    if (response.code === 200) {
      return { data: response.data.list, total: response.data.total, success: true }
    }
  } catch (error) {
    console.error(t('config.loadConfigFailed'), error)
  }
  return { data: [], total: 0, success: false }
}

// load all configs for group count
const loadAllConfigs = async () => {
  try {
    const response = await getConfigList({ page: 1, pageSize: 100 }) as any
    if (response.code === 200) allConfigs.value = response.data.list
  } catch {}
}

const handleAdd = () => {
  form.value = { name: '', key: '', value: '', valueType: 'string', group: selectedGroup.value, sort: 0, description: '' }
  modalVisible.value = true
}

const handleEdit = (record: SysConfig) => {
  form.value = { ...record }
  modalVisible.value = true
}

const handleDelete = (record: SysConfig) => {
  Modal.confirm({
    title: t('config.confirmDelete'),
    content: t('config.confirmDeleteContent', { name: record.name }),
    onOk: async () => {
      try {
        const response = await deleteConfig(record.id) as any
        if (response.code === 200) {
          message.success(t('config.deleteSuccess'))
          refreshKey.value++
          loadAllConfigs()
        } else {
          message.error(response.message || t('config.deleteFailed'))
        }
      } catch { message.error(t('config.deleteFailed')) }
    }
  })
}

const handleSubmit = async () => {
  if (!form.value.name || !form.value.key) {
    message.warning(t('config.requiredFields'))
    return
  }
  try {
    if (form.value.id) {
      const response = await updateConfig(form.value.id, form.value) as any
      if (response.code === 200) { message.success(t('config.updateSuccess')); modalVisible.value = false; refreshKey.value++; loadAllConfigs() }
    } else {
      const response = await createConfig(form.value) as any
      if (response.code === 200) { message.success(t('config.createSuccess')); modalVisible.value = false; refreshKey.value++; loadAllConfigs() }
      else message.error(response.message || t('config.operateFailed'))
    }
  } catch { message.error(t('config.operateFailed')) }
}

loadAllConfigs()
</script>

<style scoped lang="scss">
.config-container {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.config-groups {
  width: 200px;
  flex-shrink: 0;
  background: var(--color-bg-container);
  border-radius: 8px;
  padding: 20px 12px 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .config-groups-header {
    padding: 0 8px;
    margin-bottom: 12px;
    h3 { margin: 0; font-size: 15px; font-weight: 600; }
  }

  .config-groups-list {
    flex: 1;

    .config-group-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      margin-bottom: 4px;
      transition: all 0.2s;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 0;
        background: var(--ant-primary-color);
        border-radius: 0 3px 3px 0;
        transition: height 0.2s;
      }

      &:hover { background: var(--color-fill-quaternary, #fafafa); }

      &.active {
        background: var(--ant-primary-color-deprecated-l-50, rgba(22, 119, 255, 0.06));
        &::before { height: 60%; }
        .group-name { color: var(--ant-primary-color); font-weight: 600; }
      }

      .group-name { font-size: 14px; }
      .group-count {
        font-size: 12px;
        color: var(--color-text-quaternary, #bfbfbf);
        background: var(--color-fill-quaternary, #f5f5f5);
        padding: 0 8px;
        border-radius: 10px;
        line-height: 20px;
      }
    }
  }
}

.config-data {
  flex: 1;
  background: var(--color-bg-container);
  border-radius: 8px;
  padding: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-width: 0;

  :deep(.ant-table-thead > tr > th) { background: #fafafa; }

  .config-value {
    font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
    font-size: 13px;
    color: var(--color-text-secondary);
  }
}
</style>
