<template>
  <div class="page-container">
    <div class="dict-container">
      <!-- dict type list -->
      <div class="dict-types">
        <div class="dict-types-header">
          <h3>{{ t('dict.dictType') }}</h3>
          <a-button type="primary" size="small" @click="handleAddType">
            <template #icon><PlusOutlined /></template>
            {{ t('common.add') }}
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
              <a-tooltip :title="t('common.edit')">
                <a-button type="text" size="small" @click="handleEditType(type)">
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip :title="t('common.delete')">
                <a-button type="text" size="small" danger @click="handleDeleteType(type)">
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>

      <!-- dict data list -->
      <div class="dict-data">
        <ProTable
          v-if="selectedTypeCode"
          :key="selectedTypeCode"
          :columns="columns"
          :request="loadData"
          :search="false"
          :toolbar="{ title: t('dict.dictDataTitle', { name: selectedTypeName }) }"
        >
          <template #toolbar-actions>
            <a-button type="primary" @click="handleAdd">
              <PlusOutlined /> {{ t('dict.createData') }}
            </a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <ProStatus :value="record.status" :status-map="dictStatusMap" />
            </template>
            <template v-if="column.key === 'action'">
              <a-space :size="4">
                <a-button type="link" size="small" @click="handleEdit(record)">
                  <template #icon><EditOutlined /></template>
                  {{ t('common.edit') }}
                </a-button>
                <a-button type="link" size="small" danger @click="handleDelete(record)">
                  <template #icon><DeleteOutlined /></template>
                  {{ t('common.delete') }}
                </a-button>
              </a-space>
            </template>
          </template>
        </ProTable>
        <div v-else class="dict-data-empty">
          <a-empty :description="t('dict.selectTypeHint')" />
        </div>
      </div>
    </div>

    <!-- dict type modal -->
    <a-modal
      v-model:open="typeModalVisible"
      :title="typeModalTitle"
      @ok="handleTypeSubmit"
    >
      <a-form :model="typeForm" :label-col="{ span: 6 }">
        <a-form-item :label="t('dict.typeName')" required>
          <a-input v-model:value="typeForm.name" :placeholder="t('dict.typeNamePlaceholder')" />
        </a-form-item>
        <a-form-item :label="t('dict.typeCode')" required>
          <a-input v-model:value="typeForm.code" :placeholder="t('dict.typeCodePlaceholder')" :disabled="!!typeForm.id" />
        </a-form-item>
        <a-form-item :label="t('dict.description')">
          <a-textarea v-model:value="typeForm.description" :placeholder="t('dict.descriptionPlaceholder')" :rows="3" />
        </a-form-item>
        <a-form-item :label="t('common.status')">
          <a-radio-group v-model:value="typeForm.status">
            <a-radio value="enabled">{{ t('dict.enabled') }}</a-radio>
            <a-radio value="disabled">{{ t('dict.disabled') }}</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- dict data modal -->
    <a-modal
      v-model:open="dataModalVisible"
      :title="dataModalTitle"
      @ok="handleDataSubmit"
    >
      <a-form :model="dataForm" :label-col="{ span: 6 }">
        <a-form-item :label="t('dict.dictLabel')" required>
          <a-input v-model:value="dataForm.label" :placeholder="t('dict.labelPlaceholder')" />
        </a-form-item>
        <a-form-item :label="t('dict.dictValue')" required>
          <a-input v-model:value="dataForm.value" :placeholder="t('dict.valuePlaceholder')" />
        </a-form-item>
        <a-form-item :label="t('dict.sort')">
          <a-input-number v-model:value="dataForm.sort" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item :label="t('common.status')">
          <a-radio-group v-model:value="dataForm.status">
            <a-radio value="enabled">{{ t('dict.enabled') }}</a-radio>
            <a-radio value="disabled">{{ t('dict.disabled') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="t('dict.remark')">
          <a-textarea v-model:value="dataForm.remark" :placeholder="t('dict.remarkPlaceholder')" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message, Modal } from 'antdv-next'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@antdv-next/icons'
import { useI18n } from 'vue-i18n'
import ProTable from '@/components/Pro/ProTable/index.vue'
import ProStatus from '@/components/Pro/ProStatus/index.vue'
import type { ProTableColumn, ProStatusMap } from '@/types/pro'
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

const { t } = useI18n()
const dictStore = useDictStore()

const dictStatusMap = computed<ProStatusMap>(() => ({
  enabled: { text: t('dict.enabled'), color: '#52c41a' },
  disabled: { text: t('dict.disabled'), color: '#bfbfbf' }
}))

// dict type list
const dictTypes = ref<DictType[]>([])
const selectedTypeCode = ref<string>('')
const selectedTypeName = computed(() => {
  const type = dictTypes.value.find(t => t.code === selectedTypeCode.value)
  return type?.name || ''
})

// dict type modal
const typeModalVisible = ref(false)
const typeModalTitle = computed(() => typeForm.value.id ? t('dict.editType') : t('dict.createType'))
const typeForm = ref<Partial<DictType>>({
  name: '',
  code: '',
  description: '',
  status: 'enabled'
})

// dict data modal
const dataModalVisible = ref(false)
const dataModalTitle = computed(() => dataForm.value.id ? t('dict.editData') : t('dict.createData'))
const dataForm = ref<Partial<DictData>>({
  label: '',
  value: '',
  sort: 0,
  status: 'enabled',
  remark: ''
})

// table columns
const columns: ProTableColumn[] = [
  {
    title: t('dict.dictLabel'),
    dataIndex: 'label',
    key: 'label'
  },
  {
    title: t('dict.dictValue'),
    dataIndex: 'value',
    key: 'value'
  },
  {
    title: t('dict.sort'),
    dataIndex: 'sort',
    key: 'sort',
    width: 80
  },
  {
    title: t('common.status'),
    dataIndex: 'status',
    key: 'status',
    width: 80
  },
  {
    title: t('dict.remark'),
    dataIndex: 'remark',
    key: 'remark'
  },
  {
    title: t('common.actions'),
    key: 'action',
    width: 150,
    fixed: 'right'
  }
]

// load dict type list
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
    console.error(t('dict.loadTypeFailed'), error)
  }
}

// load dict data list
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
    console.error(t('dict.loadDataFailed'), error)
  }
  return {
    data: [],
    total: 0,
    success: false
  }
}

// select dict type
const handleSelectType = (type: DictType) => {
  selectedTypeCode.value = type.code
}

// add dict type
const handleAddType = () => {
  typeForm.value = {
    name: '',
    code: '',
    description: '',
    status: 'enabled'
  }
  typeModalVisible.value = true
}

// edit dict type
const handleEditType = (type: DictType) => {
  typeForm.value = { ...type }
  typeModalVisible.value = true
}

// delete dict type
const handleDeleteType = (type: DictType) => {
  Modal.confirm({
    title: t('dict.confirmDelete'),
    content: t('dict.confirmDeleteType', { name: type.name }),
    onOk: async () => {
      try {
        const response = await deleteDictType(type.id) as any
        if (response.code === 200) {
          message.success(t('dict.deleteSuccess'))
          loadDictTypes()
          if (selectedTypeCode.value === type.code) {
            selectedTypeCode.value = ''
          }
        }
      } catch (error) {
        message.error(t('dict.deleteFailed'))
      }
    }
  })
}

// submit dict type
const handleTypeSubmit = async () => {
  if (!typeForm.value.name || !typeForm.value.code) {
    message.warning(t('dict.requiredFields'))
    return
  }

  try {
    if (typeForm.value.id) {
      const response = await updateDictType(typeForm.value.id, typeForm.value) as any
      if (response.code === 200) {
        message.success(t('dict.updateSuccess'))
        typeModalVisible.value = false
        loadDictTypes()
      }
    } else {
      const response = await createDictType(typeForm.value) as any
      if (response.code === 200) {
        message.success(t('dict.createSuccess'))
        typeModalVisible.value = false
        loadDictTypes()
      }
    }
  } catch (error) {
    message.error(t('dict.operateFailed'))
  }
}

// add dict data
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

// edit dict data
const handleEdit = (record: DictData) => {
  dataForm.value = { ...record }
  dataModalVisible.value = true
}

// delete dict data
const handleDelete = (record: DictData) => {
  Modal.confirm({
    title: t('dict.confirmDelete'),
    content: t('dict.confirmDeleteData', { label: record.label }),
    onOk: async () => {
      try {
        const response = await deleteDictData(record.id) as any
        if (response.code === 200) {
          message.success(t('dict.deleteSuccess'))
          // refresh dict cache
          dictStore.refreshDictData()
        }
      } catch (error) {
        message.error(t('dict.deleteFailed'))
      }
    }
  })
}

// submit dict data
const handleDataSubmit = async () => {
  if (!dataForm.value.label || !dataForm.value.value) {
    message.warning(t('dict.requiredFields'))
    return
  }

  try {
    if (dataForm.value.id) {
      const response = await updateDictData(dataForm.value.id, dataForm.value) as any
      if (response.code === 200) {
        message.success(t('dict.updateSuccess'))
        dataModalVisible.value = false
        // refresh dict cache
        dictStore.refreshDictData()
      }
    } else {
      const response = await createDictData(dataForm.value) as any
      if (response.code === 200) {
        message.success(t('dict.createSuccess'))
        dataModalVisible.value = false
        // refresh dict cache
        dictStore.refreshDictData()
      }
    }
  } catch (error) {
    message.error(t('dict.operateFailed'))
  }
}

// init
loadDictTypes()
</script>

<style scoped lang="scss">
.dict-container {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

// dict types panel
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

    // custom scrollbar
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

      // left indicator
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

// dict data panel
.dict-data {
  flex: 1;
  background: var(--color-bg-container);
  border-radius: 8px;
  padding: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-width: 0;

  // table header background
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
</style>
