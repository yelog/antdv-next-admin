<template>
  <div class="page-container">
    <div class="config-container">
      <!-- 左侧：分组导航 -->
      <div class="config-groups">
        <div class="config-groups-header">
          <h3>配置分组</h3>
        </div>
        <div class="config-groups-list">
          <div
            v-for="group in groups"
            :key="group"
            class="config-group-item"
            :class="{ active: selectedGroup === group }"
            @click="selectedGroup = group"
          >
            <span class="group-name">{{ group }}</span>
            <span class="group-count">{{ getGroupCount(group) }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧：配置列表 -->
      <div class="config-data">
        <ProTable
          :key="selectedGroup + refreshKey"
          :columns="columns"
          :request="loadConfigList"
          :search="false"
          :toolbar="{
            title: selectedGroup,
            actions: [
              {
                label: '新增配置',
                type: 'primary',
                icon: 'PlusOutlined',
                onClick: handleAdd
              }
            ]
          }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'value'">
              <template v-if="record.valueType === 'boolean'">
                <a-tag :color="record.value === 'true' ? 'green' : 'default'">
                  {{ record.value === 'true' ? '是' : '否' }}
                </a-tag>
              </template>
              <template v-else>
                <span class="config-value">{{ record.value }}</span>
              </template>
            </template>
            <template v-if="column.key === 'valueType'">
              <a-tag>{{ valueTypeLabel[record.valueType] || record.valueType }}</a-tag>
            </template>
            <template v-if="column.key === 'builtIn'">
              <a-tag :color="record.builtIn ? 'blue' : 'default'">
                {{ record.builtIn ? '内置' : '自定义' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-space :size="4">
                <a-button type="link" size="small" @click="handleEdit(record)">
                  <template #icon><EditOutlined /></template>
                  编辑
                </a-button>
                <a-button
                  v-if="!record.builtIn"
                  type="link"
                  size="small"
                  danger
                  @click="handleDelete(record)"
                >
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </a-space>
            </template>
          </template>
        </ProTable>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <a-modal v-model:open="modalVisible" :title="modalTitle" @ok="handleSubmit" :width="520">
      <a-form :model="form" :label-col="{ span: 6 }" style="margin-top: 16px">
        <a-form-item label="配置名称" required>
          <a-input v-model:value="form.name" placeholder="请输入配置名称" />
        </a-form-item>
        <a-form-item label="配置键" required>
          <a-input v-model:value="form.key" placeholder="如 site.name" :disabled="!!form.id" />
        </a-form-item>
        <a-form-item label="配置值" required>
          <a-switch v-if="form.valueType === 'boolean'" v-model:checked="boolValue" />
          <a-input-number v-else-if="form.valueType === 'number'" v-model:value="form.value" style="width: 100%" />
          <a-textarea v-else-if="form.valueType === 'json'" v-model:value="form.value" :rows="4" placeholder="JSON 格式" />
          <a-input v-else v-model:value="form.value" placeholder="请输入配置值" />
        </a-form-item>
        <a-form-item label="值类型">
          <a-select v-model:value="form.valueType" :disabled="!!form.id">
            <a-select-option value="string">字符串</a-select-option>
            <a-select-option value="number">数字</a-select-option>
            <a-select-option value="boolean">布尔值</a-select-option>
            <a-select-option value="json">JSON</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="分组">
          <a-select v-model:value="form.group" allow-clear>
            <a-select-option v-for="g in groups" :key="g" :value="g">{{ g }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="form.sort" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="form.description" placeholder="请输入描述" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message, Modal } from 'antdv-next'
import { EditOutlined, DeleteOutlined } from '@antdv-next/icons'
import ProTable from '@/components/Pro/ProTable/index.vue'
import type { ProTableColumn } from '@/types/pro'
import type { SysConfig } from '@/types/config'
import { getConfigList, createConfig, updateConfig, deleteConfig } from '@/api/config'

const groups = ref<string[]>(['基础配置', '安全配置', '上传配置', '通知配置'])
const selectedGroup = ref('基础配置')
const allConfigs = ref<SysConfig[]>([])
const refreshKey = ref(0)

const valueTypeLabel: Record<string, string> = {
  string: '字符串',
  number: '数字',
  boolean: '布尔值',
  json: 'JSON'
}

const getGroupCount = (group: string) => allConfigs.value.filter(c => c.group === group).length

// 弹窗
const modalVisible = ref(false)
const modalTitle = computed(() => form.value.id ? '编辑配置' : '新增配置')
const form = ref<Partial<SysConfig>>({
  name: '', key: '', value: '', valueType: 'string', group: '基础配置', sort: 0, description: ''
})
const boolValue = computed({
  get: () => form.value.value === 'true',
  set: (v: boolean) => { form.value.value = String(v) }
})

const columns: ProTableColumn[] = [
  { title: '配置名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '配置键', dataIndex: 'key', key: 'key', width: 200 },
  { title: '配置值', dataIndex: 'value', key: 'value', ellipsis: true },
  { title: '类型', dataIndex: 'valueType', key: 'valueType', width: 90 },
  { title: '来源', dataIndex: 'builtIn', key: 'builtIn', width: 90 },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
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
    console.error('加载配置失败:', error)
  }
  return { data: [], total: 0, success: false }
}

// 加载全部配置用于分组计数
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
    title: '确认删除',
    content: `确定要删除配置"${record.name}"吗？`,
    onOk: async () => {
      try {
        const response = await deleteConfig(record.id) as any
        if (response.code === 200) {
          message.success('删除成功')
          refreshKey.value++
          loadAllConfigs()
        } else {
          message.error(response.message || '删除失败')
        }
      } catch { message.error('删除失败') }
    }
  })
}

const handleSubmit = async () => {
  if (!form.value.name || !form.value.key) {
    message.warning('请填写必填项')
    return
  }
  try {
    if (form.value.id) {
      const response = await updateConfig(form.value.id, form.value) as any
      if (response.code === 200) { message.success('更新成功'); modalVisible.value = false; refreshKey.value++; loadAllConfigs() }
    } else {
      const response = await createConfig(form.value) as any
      if (response.code === 200) { message.success('创建成功'); modalVisible.value = false; refreshKey.value++; loadAllConfigs() }
      else message.error(response.message || '创建失败')
    }
  } catch { message.error('操作失败') }
}

loadAllConfigs()
</script>

<style scoped lang="scss">
.config-container {
  display: flex;
  gap: 16px;
  height: calc(100vh - 180px);
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
