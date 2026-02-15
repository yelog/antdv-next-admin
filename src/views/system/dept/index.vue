<template>
  <div class="page-container">
    <div class="dept-container">
      <!-- dept tree -->
      <div class="dept-tree">
        <div class="dept-tree-header">
          <h3>{{ t('dept.organizationStructure') }}</h3>
          <a-button type="primary" size="small" @click="handleAdd(null)">
            <template #icon><PlusOutlined /></template>
            {{ t('common.add') }}
          </a-button>
        </div>
        <div class="dept-tree-search">
          <a-input-search
            v-model:value="searchText"
            :placeholder="t('dept.searchDept')"
            allow-clear
            @search="loadDeptTree"
          />
        </div>
        <div class="dept-tree-body">
          <a-tree
            v-if="treeData.length"
            :tree-data="treeData"
            :field-names="{ title: 'name', key: 'id', children: 'children' }"
            :selected-keys="selectedKeys"
            default-expand-all
            block-node
            @select="handleTreeSelect"
          >
            <template #title="{ name, status }">
              <div class="tree-node">
                <span class="tree-node-name">{{ name }}</span>
                <span v-if="status === 'disabled'" class="tree-node-badge">{{ t('dept.disabled') }}</span>
              </div>
            </template>
          </a-tree>
          <a-empty v-else :image="null" :description="t('common.noData')" />
        </div>
      </div>

      <!-- dept detail -->
      <div class="dept-detail">
        <template v-if="selectedDept">
          <div class="dept-detail-header">
            <div class="dept-detail-title">
              <h3>{{ selectedDept.name }}</h3>
              <span class="status-tag" :class="selectedDept.status === 'enabled' ? 'status-enabled' : 'status-disabled'">
                <span class="status-dot" />
                {{ selectedDept.status === 'enabled' ? t('dept.enabled') : t('dept.disabled') }}
              </span>
            </div>
            <a-space>
              <a-button type="primary" size="small" @click="handleAdd(selectedDept.id)">
                <template #icon><PlusOutlined /></template>
                {{ t('dept.addChildDept') }}
              </a-button>
              <a-button size="small" @click="handleEdit(selectedDept)">
                <template #icon><EditOutlined /></template>
                {{ t('common.edit') }}
              </a-button>
              <a-button size="small" danger @click="handleDelete(selectedDept)">
                <template #icon><DeleteOutlined /></template>
                {{ t('common.delete') }}
              </a-button>
            </a-space>
          </div>
          <ProDescriptions
            :columns="deptDescColumns"
            :data="deptDescData"
            :column="2"
            bordered
            size="middle"
            class="dept-descriptions"
          />

          <!-- child dept list -->
          <div class="dept-children">
            <ProTable
              :key="selectedDept.id"
              :columns="childColumns"
              :request="loadChildDepts"
              :search="false"
              :pagination="false"
              :toolbar="{
                title: `${t('dept.childDepts')} (${childDepts.length})`
              }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <span class="status-tag" :class="record.status === 'enabled' ? 'status-enabled' : 'status-disabled'">
                    <span class="status-dot" />
                    {{ record.status === 'enabled' ? t('dept.enabled') : t('dept.disabled') }}
                  </span>
                </template>
                <template v-if="column.key === 'action'">
                  <a-space :size="4">
                    <a-button type="link" size="small" @click="selectDept(record.id)">{{ t('common.view') }}</a-button>
                    <a-button type="link" size="small" @click="handleEdit(record)">{{ t('common.edit') }}</a-button>
                  </a-space>
                </template>
              </template>
            </ProTable>
          </div>
        </template>
        <div v-else class="dept-detail-empty">
          <a-empty :description="t('dept.selectDeptNode')" />
        </div>
      </div>
    </div>

    <!-- add/edit modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      :width="520"
    >
      <a-form :model="form" :label-col="{ span: 6 }" style="margin-top: 16px">
        <a-form-item :label="t('dept.parentDept')">
          <a-tree-select
            v-model:value="form.parentId"
            :tree-data="parentTreeData"
            :field-names="{ label: 'name', value: 'id', children: 'children' }"
            :placeholder="t('dept.noneTopLevelDept')"
            allow-clear
            tree-default-expand-all
          />
        </a-form-item>
        <a-form-item :label="t('dept.deptName')" required>
          <a-input v-model:value="form.name" :placeholder="t('dept.pleaseEnterDeptName')" />
        </a-form-item>
        <a-form-item :label="t('dept.leader')">
          <a-input v-model:value="form.leader" :placeholder="t('dept.pleaseEnterLeader')" />
        </a-form-item>
        <a-form-item :label="t('dept.phone')">
          <a-input v-model:value="form.phone" :placeholder="t('dept.pleaseEnterPhone')" />
        </a-form-item>
        <a-form-item :label="t('dept.email')">
          <a-input v-model:value="form.email" :placeholder="t('dept.pleaseEnterEmail')" />
        </a-form-item>
        <a-form-item :label="t('dept.sort')">
          <a-input-number v-model:value="form.sort" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item :label="t('dept.status')">
          <a-radio-group v-model:value="form.status">
            <a-radio value="enabled">{{ t('dept.enabled') }}</a-radio>
            <a-radio value="disabled">{{ t('dept.disabled') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="t('dept.remark')">
          <a-textarea v-model:value="form.remark" :placeholder="t('dept.pleaseEnterRemark')" :rows="3" />
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
import ProDescriptions from '@/components/Pro/ProDescriptions/index.vue'
import type { ProTableColumn, ProDescriptionItem } from '@/types/pro'
import type { Department } from '@/types/dept'
import { getDeptTree, getDeptList, createDept, updateDept, deleteDept } from '@/api/dept'

const { t } = useI18n()

const searchText = ref('')
const treeData = ref<Department[]>([])
const flatList = ref<Department[]>([])
const selectedKeys = ref<string[]>([])

const selectedDept = computed(() => {
  if (!selectedKeys.value.length) return null
  return flatList.value.find(d => d.id === selectedKeys.value[0]) || null
})

const childDepts = computed(() => {
  if (!selectedDept.value) return []
  return flatList.value
    .filter(d => d.parentId === selectedDept.value!.id)
    .sort((a, b) => a.sort - b.sort)
})

const parentTreeData = computed(() => {
  const root: Department = { id: '', name: t('dept.noneTopLevelDept'), parentId: null, sort: 0, status: 'enabled', createTime: '', updateTime: '' }
  return [{ ...root, children: treeData.value }]
})

// modal
const modalVisible = ref(false)
const modalTitle = computed(() => form.value.id ? t('dept.editDept') : t('dept.createDept'))
const form = ref<Partial<Department>>({
  name: '',
  parentId: null,
  leader: '',
  phone: '',
  email: '',
  sort: 0,
  status: 'enabled',
  remark: ''
})

const childColumns = computed<ProTableColumn[]>(() => [
  { title: t('dept.deptName'), dataIndex: 'name', key: 'name' },
  { title: t('dept.leader'), dataIndex: 'leader', key: 'leader', width: 100 },
  { title: t('dept.sort'), dataIndex: 'sort', key: 'sort', width: 70 },
  { title: t('dept.status'), dataIndex: 'status', key: 'status', width: 80 },
  { title: t('common.actions'), key: 'action', width: 120 }
])

const deptDescColumns = computed<ProDescriptionItem[]>(() => [
  { label: t('dept.deptName'), dataIndex: 'name' },
  { label: t('dept.parentDept'), dataIndex: 'parentName' },
  { label: t('dept.leader'), dataIndex: 'leader' },
  { label: t('dept.phone'), dataIndex: 'phone' },
  { label: t('dept.email'), dataIndex: 'email' },
  { label: t('dept.sort'), dataIndex: 'sort' },
  { label: t('dept.createTime'), dataIndex: 'createTime' },
  { label: t('dept.updateTime'), dataIndex: 'updateTime' },
  { label: t('dept.remark'), dataIndex: 'remark', span: 2 }
])

const deptDescData = computed(() => {
  if (!selectedDept.value) return {}
  return {
    ...selectedDept.value,
    parentName: getParentName(selectedDept.value.parentId)
  }
})

const getParentName = (parentId: string | null) => {
  if (!parentId) return t('dept.noneTopLevel')
  return flatList.value.find(d => d.id === parentId)?.name || '-'
}

const selectDept = (id: string) => {
  selectedKeys.value = [id]
}

const loadChildDepts = async () => {
  return {
    data: childDepts.value,
    total: childDepts.value.length,
    success: true
  }
}

const loadDeptTree = async () => {
  try {
    const params: any = {}
    if (searchText.value) params.name = searchText.value
    const [treeRes, listRes] = await Promise.all([
      getDeptTree(params) as any,
      getDeptList() as any
    ])
    if (treeRes.code === 200) treeData.value = treeRes.data
    if (listRes.code === 200) flatList.value = listRes.data
    // select first by default
    if (!selectedKeys.value.length && treeData.value.length) {
      selectedKeys.value = [treeData.value[0].id]
    }
  } catch (error) {
    console.error(t('dept.loadDataFailed'), error)
  }
}

const handleTreeSelect = (keys: string[]) => {
  if (keys.length) selectedKeys.value = keys
}

const handleAdd = (parentId: string | null) => {
  form.value = {
    name: '',
    parentId,
    leader: '',
    phone: '',
    email: '',
    sort: 0,
    status: 'enabled',
    remark: ''
  }
  modalVisible.value = true
}

const handleEdit = (dept: Department) => {
  form.value = { ...dept }
  modalVisible.value = true
}

const handleDelete = (dept: Department) => {
  const hasChildren = flatList.value.some(d => d.parentId === dept.id)
  if (hasChildren) {
    message.warning(t('dept.hasChildrenWarning'))
    return
  }
  Modal.confirm({
    title: t('dept.confirmDelete'),
    content: t('dept.confirmDeleteContent', { name: dept.name }),
    onOk: async () => {
      try {
        const response = await deleteDept(dept.id) as any
        if (response.code === 200) {
          message.success(t('dept.deleteSuccess'))
          selectedKeys.value = []
          loadDeptTree()
        } else {
          message.error(response.message || t('dept.deleteFailed'))
        }
      } catch (error) {
        message.error(t('dept.deleteFailed'))
      }
    }
  })
}

const handleSubmit = async () => {
  if (!form.value.name) {
    message.warning(t('dept.pleaseEnterDeptName'))
    return
  }
  try {
    if (form.value.id) {
      const response = await updateDept(form.value.id, form.value) as any
      if (response.code === 200) {
        message.success(t('dept.updateSuccess'))
        modalVisible.value = false
        loadDeptTree()
      }
    } else {
      const response = await createDept(form.value) as any
      if (response.code === 200) {
        message.success(t('dept.createSuccess'))
        modalVisible.value = false
        loadDeptTree()
      }
    }
  } catch (error) {
    message.error(t('dept.operateFailed'))
  }
}

// init
loadDeptTree()
</script>

<style scoped lang="scss">
.dept-container {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

// dept tree panel
.dept-tree {
  width: 280px;
  flex-shrink: 0;
  background: var(--color-bg-container);
  border-radius: 8px;
  padding: 20px 16px 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .dept-tree-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--color-text);
    }
  }

  .dept-tree-search {
    margin-bottom: 12px;
  }

  .dept-tree-body {
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }

    :deep(.ant-tree-node-content-wrapper) {
      flex: 1;
    }

    .tree-node {
      display: flex;
      align-items: center;
      gap: 8px;

      .tree-node-name {
        flex: 1;
      }

      .tree-node-badge {
        font-size: 11px;
        padding: 0 6px;
        border-radius: 8px;
        background: #fff1f0;
        color: #cf1322;
        line-height: 18px;
      }
    }
  }
}

// dept detail panel
.dept-detail {
  flex: 1;
  background: var(--color-bg-container);
  border-radius: 8px;
  padding: 20px 24px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-width: 0;

  .dept-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border-secondary, #f0f0f0);

    .dept-detail-title {
      display: flex;
      align-items: center;
      gap: 12px;

      h3 {
        margin: 0;
        font-size: 17px;
        font-weight: 600;
      }
    }
  }

  .dept-descriptions {
    margin-bottom: 24px;
  }

  .dept-children {
    :deep(.ant-table-thead > tr > th) {
      background: #fafafa;
    }
  }

  .dept-detail-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
}

// status tag
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
    .status-dot { background: #52c41a; }
  }

  &.status-disabled {
    background: #f5f5f5;
    color: #8c8c8c;
    .status-dot { background: #bfbfbf; }
  }
}
</style>
