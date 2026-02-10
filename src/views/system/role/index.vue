<template>
  <div class="page-container">
    <div class="card page-card">
      <a-form :model="searchForm" layout="inline" class="filter-form">
        <a-form-item :label="$t('role.name')">
          <a-input v-model:value="searchForm.name" allow-clear />
        </a-form-item>

        <a-form-item :label="$t('role.code')">
          <a-input v-model:value="searchForm.code" allow-clear />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              {{ $t('common.search') }}
            </a-button>
            <a-button @click="handleReset">
              {{ $t('common.reset') }}
            </a-button>
            <a-button type="primary" class="create-btn" @click="openCreate">
              <PlusOutlined />
              {{ $t('role.createRole') }}
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table
        row-key="id"
        :loading="loading"
        :columns="columns"
        :data-source="roleList"
        :pagination="pagination"
        size="middle"
        class="role-table"
        :scroll="{ x: 980 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'permissionCount'">
            <a-tag color="processing">
              {{ record.permissions?.length || 0 }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'updatedAt'">
            <span>{{ formatDate(record.updatedAt) }}</span>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-space class="row-actions" :size="4">
              <a-tooltip :title="$t('common.edit')">
                <a-button type="text" class="action-btn edit-btn" @click="openEdit(record)">
                  <EditOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip :title="$t('common.delete')">
                <a-button type="text" danger class="action-btn delete-btn" @click="handleDelete(record)">
                  <DeleteOutlined />
                </a-button>
              </a-tooltip>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <a-modal
      v-model:open="formOpen"
      :title="editingRoleId ? $t('role.editRole') : $t('role.createRole')"
      :confirm-loading="submitting"
      width="820px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form ref="formRef" :model="formModel" :rules="formRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="name" :label="$t('role.name')">
              <a-input v-model:value="formModel.name" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="code" :label="$t('role.code')">
              <a-input v-model:value="formModel.code" :disabled="Boolean(editingRoleId)" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item name="description" :label="$t('role.description')">
              <a-textarea v-model:value="formModel.description" :rows="3" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="$t('role.permissions')">
              <div class="permission-tree-wrapper">
                <a-tree
                  v-model:checkedKeys="checkedPermissionIds"
                  checkable
                  :tree-data="permissionTreeData"
                  :height="300"
                />
              </div>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { message, Modal } from 'antdv-next'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@antdv-next/icons'
import { useI18n } from 'vue-i18n'
import { createRole, deleteRole, getRoleList, updateRole } from '@/api/role'
import { getPermissionTree } from '@/api/permission'
import type { Permission, Role } from '@/types/auth'

interface RoleSearchForm {
  name: string
  code: string
}

interface RoleFormModel {
  name: string
  code: string
  description: string
}

interface TablePagination {
  current?: number
  pageSize?: number
}

interface RoleFormRef {
  validate: () => Promise<void>
  resetFields: () => void
}

interface PermissionTreeNode {
  title: string
  key: string
  children?: PermissionTreeNode[]
}

const { t } = useI18n()

const loading = ref(false)
const submitting = ref(false)
const formOpen = ref(false)
const editingRoleId = ref<string | null>(null)
const roleList = ref<Role[]>([])
const permissionTree = ref<Permission[]>([])
const checkedPermissionIds = ref<string[]>([])
const formRef = ref<RoleFormRef | null>(null)

const pager = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const searchForm = reactive<RoleSearchForm>({
  name: '',
  code: ''
})

const createDefaultForm = (): RoleFormModel => ({
  name: '',
  code: '',
  description: ''
})

const formModel = reactive<RoleFormModel>(createDefaultForm())

const columns = [
  { title: t('role.name'), dataIndex: 'name', key: 'name', width: 200 },
  { title: t('role.code'), dataIndex: 'code', key: 'code', width: 200 },
  { title: t('role.description'), dataIndex: 'description', key: 'description' },
  { title: t('role.permissions'), key: 'permissionCount', width: 120, align: 'center' as const },
  { title: t('common.updateTime'), dataIndex: 'updatedAt', key: 'updatedAt', width: 200 },
  { title: t('common.actions'), key: 'action', width: 120, fixed: 'right' as const }
]

const pagination = computed(() => ({
  current: pager.current,
  pageSize: pager.pageSize,
  total: pager.total,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`
}))

const formRules = {
  name: [{ required: true, message: '请输入角色名称' }],
  code: [
    { required: true, message: '请输入角色编码' },
    { pattern: /^[a-zA-Z0-9_.-]+$/, message: '角色编码仅支持字母、数字、下划线和中划线' }
  ]
}

const permissionTreeData = computed<PermissionTreeNode[]>(() => {
  const toTreeNode = (permissions: Permission[]): PermissionTreeNode[] => {
    return permissions.map(permission => ({
      title: `${permission.name} (${permission.code})`,
      key: permission.id,
      children: permission.children && permission.children.length > 0
        ? toTreeNode(permission.children)
        : undefined
    }))
  }
  return toTreeNode(permissionTree.value)
})

const permissionMap = computed(() => {
  const map = new Map<string, Permission>()

  const traverse = (permissions: Permission[]) => {
    permissions.forEach(permission => {
      map.set(permission.id, {
        ...permission,
        children: permission.children ? [...permission.children] : undefined
      })
      if (permission.children && permission.children.length > 0) {
        traverse(permission.children)
      }
    })
  }

  traverse(permissionTree.value)
  return map
})

const formatDate = (value: string) => {
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

const resetFormModel = () => {
  Object.assign(formModel, createDefaultForm())
  checkedPermissionIds.value = []
}

const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await getRoleList({
      current: pager.current,
      pageSize: pager.pageSize,
      name: searchForm.name.trim() || undefined,
      code: searchForm.code.trim() || undefined
    })
    roleList.value = response.data.list
    pager.total = response.data.total
  } finally {
    loading.value = false
  }
}

const fetchPermissionTree = async () => {
  const response = await getPermissionTree()
  permissionTree.value = response.data
}

const handleSearch = () => {
  pager.current = 1
  fetchRoles()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.code = ''
  pager.current = 1
  fetchRoles()
}

const handleTableChange = (paginationData: TablePagination) => {
  pager.current = paginationData.current || 1
  pager.pageSize = paginationData.pageSize || 10
  fetchRoles()
}

const openCreate = () => {
  editingRoleId.value = null
  resetFormModel()
  formOpen.value = true
  formRef.value?.resetFields()
}

const openEdit = (record: Role) => {
  editingRoleId.value = record.id
  Object.assign(formModel, {
    name: record.name,
    code: record.code,
    description: record.description
  })
  checkedPermissionIds.value = record.permissions.map(permission => permission.id)
  formOpen.value = true
}

const handleCancel = () => {
  formOpen.value = false
  resetFormModel()
}

const handleDelete = (record: Role) => {
  Modal.confirm({
    title: t('role.deleteRole'),
    content: t('role.confirmDelete'),
    onOk: async () => {
      await deleteRole(record.id)
      message.success(t('common.success'))
      if (roleList.value.length === 1 && pager.current > 1) {
        pager.current -= 1
      }
      await fetchRoles()
    }
  })
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const selectedPermissions = checkedPermissionIds.value
    .map(id => permissionMap.value.get(id))
    .filter((permission): permission is Permission => Boolean(permission))

  const payload: Partial<Role> = {
    name: formModel.name.trim(),
    code: formModel.code.trim(),
    description: formModel.description.trim(),
    permissions: selectedPermissions
  }

  submitting.value = true
  try {
    if (editingRoleId.value) {
      await updateRole(editingRoleId.value, payload)
      message.success('角色更新成功')
    } else {
      await createRole(payload)
      message.success('角色创建成功')
      pager.current = 1
    }
    formOpen.value = false
    resetFormModel()
    await fetchRoles()
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchPermissionTree(), fetchRoles()])
})
</script>

<style scoped lang="scss">
.page-card {
  padding: 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
}

.filter-form {
  padding: 16px 20px 8px;
  border-bottom: 1px solid var(--color-border-secondary);
  background: linear-gradient(180deg, rgba(24, 119, 255, 0.05), rgba(24, 119, 255, 0));

  :deep(.ant-form-item) {
    margin-bottom: 10px;
  }

  :deep(.ant-input),
  :deep(.ant-input-affix-wrapper),
  :deep(.ant-select-selector) {
    background: var(--color-bg-container) !important;
    border-color: var(--color-border) !important;
  }
}

.create-btn {
  box-shadow: 0 4px 14px rgba(24, 119, 255, 0.3);
  border: none;

  &:hover {
    box-shadow: 0 8px 18px rgba(24, 119, 255, 0.36);
    transform: translateY(-1px);
  }
}

.role-table {
  padding: 10px 16px 16px;

  :deep(.ant-table-container) {
    border-radius: 12px;
    border: 1px solid var(--color-border-secondary);
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

  .row-actions {
    opacity: 0;
    transform: translateX(6px);
    transition: all var(--duration-base) var(--ease-out);
  }

  :deep(.ant-table-row:hover) .row-actions {
    opacity: 1;
    transform: translateX(0);
  }

  .action-btn {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    color: var(--color-text-secondary);

    &:hover {
      background: var(--color-bg-layout);
    }
  }

  .edit-btn:hover {
    color: var(--color-primary);
  }

  .delete-btn:hover {
    color: var(--color-error);
  }
}

.permission-tree-wrapper {
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-base);
  padding: var(--spacing-sm);
  background: var(--color-bg-layout);
}

@media (max-width: 992px) {
  .filter-form {
    :deep(.ant-form-item) {
      width: 100%;
      margin-right: 0;
    }

    :deep(.ant-form-item-control-input) {
      width: 100%;
    }
  }

  .role-table {
    .row-actions {
      opacity: 1;
      transform: none;
    }
  }
}
</style>
