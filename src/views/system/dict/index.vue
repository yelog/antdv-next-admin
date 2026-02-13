<template>
  <div class="page-container">
    <div class="dict-container">
      <!-- 左侧：字典类型列表 -->
      <div class="dict-types">
        <div class="dict-types-header">
          <h3>字典类型</h3>
          <a-button type="primary" size="small" @click="handleAddType">
            <template #icon><PlusOutlined /></template>
            新增
          </a-button>
        </div>
        <div class="dict-types-list">
          <div
            v-for="type in dictTypes"
            :key="type.id"
            class="dict-type-item"
            :class="{ active: selectedTypeCode === type.code }"
            @click="handleSelectType(type)"
          >
            <div class="type-info">
              <div class="type-name">{{ type.name }}</div>
              <div class="type-code">{{ type.code }}</div>
            </div>
            <div class="type-actions" @click.stop>
              <a-tooltip title="编辑">
                <a-button type="text" size="small" @click="handleEditType(type)">
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="删除">
                <a-button type="text" size="small" danger @click="handleDeleteType(type)">
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：字典数据列表 -->
      <div class="dict-data">
        <ProTable
          v-if="selectedTypeCode"
          :key="selectedTypeCode"
          :columns="columns"
          :request="loadData"
          :search="false"
          :toolbar="{
            title: `字典数据 - ${selectedTypeName}`,
            actions: [
              {
                label: '新增数据',
                type: 'primary',
                icon: 'PlusOutlined',
                onClick: handleAdd
              }
            ]
          }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <span class="status-tag" :class="record.status === 'enabled' ? 'status-enabled' : 'status-disabled'">
                <span class="status-dot" />
                {{ record.status === 'enabled' ? '启用' : '禁用' }}
              </span>
            </template>
            <template v-if="column.key === 'action'">
              <a-space :size="4">
                <a-button type="link" size="small" @click="handleEdit(record)">
                  <template #icon><EditOutlined /></template>
                  编辑
                </a-button>
                <a-button type="link" size="small" danger @click="handleDelete(record)">
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </a-space>
            </template>
          </template>
        </ProTable>
        <div v-else class="dict-data-empty">
          <a-empty description="请选择左侧字典类型" />
        </div>
      </div>
    </div>

    <!-- 字典类型弹窗 -->
    <a-modal
      v-model:open="typeModalVisible"
      :title="typeModalTitle"
      @ok="handleTypeSubmit"
    >
      <a-form :model="typeForm" :label-col="{ span: 6 }">
        <a-form-item label="类型名称" required>
          <a-input v-model:value="typeForm.name" placeholder="请输入类型名称" />
        </a-form-item>
        <a-form-item label="类型编码" required>
          <a-input v-model:value="typeForm.code" placeholder="请输入类型编码" :disabled="!!typeForm.id" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="typeForm.description" placeholder="请输入描述" :rows="3" />
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="typeForm.status">
            <a-radio value="enabled">启用</a-radio>
            <a-radio value="disabled">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 字典数据弹窗 -->
    <a-modal
      v-model:open="dataModalVisible"
      :title="dataModalTitle"
      @ok="handleDataSubmit"
    >
      <a-form :model="dataForm" :label-col="{ span: 6 }">
        <a-form-item label="字典标签" required>
          <a-input v-model:value="dataForm.label" placeholder="请输入字典标签" />
        </a-form-item>
        <a-form-item label="字典值" required>
          <a-input v-model:value="dataForm.value" placeholder="请输入字典值" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="dataForm.sort" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="dataForm.status">
            <a-radio value="enabled">启用</a-radio>
            <a-radio value="disabled">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="dataForm.remark" placeholder="请输入备注" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message, Modal } from 'antdv-next'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@antdv-next/icons'
import ProTable from '@/components/Pro/ProTable/index.vue'
import type { ProTableColumn } from '@/types/pro'
import type { DictType, DictData } from '@/types/dict'
import {
  getDictTypes,
  createDictType,
  updateDictType,
  deleteDictType,
  getDictDataList,
  createDictData,
  updateDictData,
  deleteDictData
} from '@/api/dict'
import { useDictStore } from '@/stores/dict'

const dictStore = useDictStore()

// 字典类型列表
const dictTypes = ref<DictType[]>([])
const selectedTypeCode = ref<string>('')
const selectedTypeName = computed(() => {
  const type = dictTypes.value.find(t => t.code === selectedTypeCode.value)
  return type?.name || ''
})

// 字典类型弹窗
const typeModalVisible = ref(false)
const typeModalTitle = computed(() => typeForm.value.id ? '编辑字典类型' : '新增字典类型')
const typeForm = ref<Partial<DictType>>({
  name: '',
  code: '',
  description: '',
  status: 'enabled'
})

// 字典数据弹窗
const dataModalVisible = ref(false)
const dataModalTitle = computed(() => dataForm.value.id ? '编辑字典数据' : '新增字典数据')
const dataForm = ref<Partial<DictData>>({
  label: '',
  value: '',
  sort: 0,
  status: 'enabled',
  remark: ''
})

// 表格列配置
const columns: ProTableColumn[] = [
  {
    title: '字典标签',
    dataIndex: 'label',
    key: 'label'
  },
  {
    title: '字典值',
    dataIndex: 'value',
    key: 'value'
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 80
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark'
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right'
  }
]

// 加载字典类型列表
const loadDictTypes = async () => {
  try {
    const response = await getDictTypes() as any
    if (response.code === 200) {
      dictTypes.value = response.data
      if (dictTypes.value.length > 0 && !selectedTypeCode.value) {
        selectedTypeCode.value = dictTypes.value[0].code
      }
    }
  } catch (error) {
    console.error('加载字典类型失败:', error)
  }
}

// 加载字典数据列表
const loadData = async (params: any) => {
  try {
    const response = await getDictDataList({
      typeCode: selectedTypeCode.value,
      page: params.current,
      pageSize: params.pageSize
    }) as any
    if (response.code === 200) {
      return {
        data: response.data.list,
        total: response.data.total,
        success: true
      }
    }
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
  return {
    data: [],
    total: 0,
    success: false
  }
}

// 选择字典类型
const handleSelectType = (type: DictType) => {
  selectedTypeCode.value = type.code
}

// 新增字典类型
const handleAddType = () => {
  typeForm.value = {
    name: '',
    code: '',
    description: '',
    status: 'enabled'
  }
  typeModalVisible.value = true
}

// 编辑字典类型
const handleEditType = (type: DictType) => {
  typeForm.value = { ...type }
  typeModalVisible.value = true
}

// 删除字典类型
const handleDeleteType = (type: DictType) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除字典类型"${type.name}"吗？`,
    onOk: async () => {
      try {
        const response = await deleteDictType(type.id) as any
        if (response.code === 200) {
          message.success('删除成功')
          loadDictTypes()
          if (selectedTypeCode.value === type.code) {
            selectedTypeCode.value = ''
          }
        }
      } catch (error) {
        message.error('删除失败')
      }
    }
  })
}

// 提交字典类型
const handleTypeSubmit = async () => {
  if (!typeForm.value.name || !typeForm.value.code) {
    message.warning('请填写必填项')
    return
  }

  try {
    if (typeForm.value.id) {
      const response = await updateDictType(typeForm.value.id, typeForm.value) as any
      if (response.code === 200) {
        message.success('更新成功')
        typeModalVisible.value = false
        loadDictTypes()
      }
    } else {
      const response = await createDictType(typeForm.value) as any
      if (response.code === 200) {
        message.success('创建成功')
        typeModalVisible.value = false
        loadDictTypes()
      }
    }
  } catch (error) {
    message.error('操作失败')
  }
}

// 新增字典数据
const handleAdd = () => {
  dataForm.value = {
    typeCode: selectedTypeCode.value,
    label: '',
    value: '',
    sort: 0,
    status: 'enabled',
    remark: ''
  }
  dataModalVisible.value = true
}

// 编辑字典数据
const handleEdit = (record: DictData) => {
  dataForm.value = { ...record }
  dataModalVisible.value = true
}

// 删除字典数据
const handleDelete = (record: DictData) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除字典数据"${record.label}"吗？`,
    onOk: async () => {
      try {
        const response = await deleteDictData(record.id) as any
        if (response.code === 200) {
          message.success('删除成功')
          // 刷新字典缓存
          dictStore.refreshDictData()
        }
      } catch (error) {
        message.error('删除失败')
      }
    }
  })
}

// 提交字典数据
const handleDataSubmit = async () => {
  if (!dataForm.value.label || !dataForm.value.value) {
    message.warning('请填写必填项')
    return
  }

  try {
    if (dataForm.value.id) {
      const response = await updateDictData(dataForm.value.id, dataForm.value) as any
      if (response.code === 200) {
        message.success('更新成功')
        dataModalVisible.value = false
        // 刷新字典缓存
        dictStore.refreshDictData()
      }
    } else {
      const response = await createDictData(dataForm.value) as any
      if (response.code === 200) {
        message.success('创建成功')
        dataModalVisible.value = false
        // 刷新字典缓存
        dictStore.refreshDictData()
      }
    }
  } catch (error) {
    message.error('操作失败')
  }
}

// 初始化
loadDictTypes()
</script>

<style scoped lang="scss">
.dict-container {
  display: flex;
  gap: 16px;
  height: calc(100vh - 180px);
}

// 左侧：字典类型
.dict-types {
  width: 260px;
  flex-shrink: 0;
  background: var(--color-bg-container);
  border-radius: 8px;
  padding: 20px 16px 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .dict-types-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border-secondary, #f0f0f0);

    h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--color-text);
    }
  }

  .dict-types-list {
    flex: 1;
    overflow-y: auto;
    margin: 0 -8px;
    padding: 0 8px;

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }

    .dict-type-item {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 12px 12px 16px;
      border-radius: 8px;
      cursor: pointer;
      margin-bottom: 4px;
      border: none;
      transition: all 0.2s ease;
      overflow: hidden;

      // 左侧指示条
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
        transition: height 0.2s ease;
      }

      &:hover {
        background: var(--color-fill-quaternary, #fafafa);

        .type-actions {
          opacity: 1;
          transform: translateX(0);
        }
      }

      &.active {
        background: var(--ant-primary-color-deprecated-l-50, rgba(22, 119, 255, 0.06));

        &::before {
          height: 60%;
        }

        .type-name {
          color: var(--ant-primary-color);
          font-weight: 600;
        }
      }

      .type-info {
        flex: 1;
        min-width: 0;

        .type-name {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 2px;
          color: var(--color-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s;
        }

        .type-code {
          font-size: 12px;
          color: var(--color-text-quaternary, #bfbfbf);
          font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .type-actions {
        display: flex;
        gap: 2px;
        opacity: 0;
        transform: translateX(8px);
        transition: all 0.2s ease;
        flex-shrink: 0;
      }
    }
  }
}

// 右侧：字典数据
.dict-data {
  flex: 1;
  background: var(--color-bg-container);
  border-radius: 8px;
  padding: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-width: 0;

  // 表头浅灰背景
  :deep(.ant-table-thead > tr > th),
  :deep(.ant-table-thead > tr > td) {
    background: #fafafa;
  }

  .dict-data-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
}

// 状态标签
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 20px;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &.status-enabled {
    background: #f6ffed;
    color: #389e0d;

    .status-dot {
      background: #52c41a;
    }
  }

  &.status-disabled {
    background: #f5f5f5;
    color: #8c8c8c;

    .status-dot {
      background: #bfbfbf;
    }
  }
}
</style>
