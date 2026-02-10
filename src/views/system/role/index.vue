<template>
  <div class="page-container">
    <ProTable
      ref="tableRef"
      :columns="columns"
      :request="fetchTableData"
      :toolbar="toolbarConfig"
      :search="{
        labelWidth: 6,
        defaultCollapsed: true
      }"
      row-key="id"
    >
      <template #toolbar-actions>
        <a-button type="primary" class="create-role-btn" @click="handleCreate">
          <PlusOutlined /> {{ $t('role.createRole') }}
        </a-button>
      </template>
    </ProTable>

    <a-modal
      v-model:open="modalVisible"
      :title="editingRoleId ? $t('role.editRole') : $t('role.createRole')"
      :confirm-loading="submitting"
      width="820px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <ProForm
        ref="formRef"
        :form-items="formItems"
        :initial-values="formData"
        :grid="{ cols: 2, gutter: 16 }"
        :layout="{ layout: 'vertical' }"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { message, Modal } from 'antdv-next'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@antdv-next/icons'
import { $t } from '@/locales'
import ProTable from '@/components/Pro/ProTable/index.vue'
import ProForm from '@/components/Pro/ProForm/index.vue'
import { createRole, deleteRole, getRoleList, updateRole } from '@/api/role'
import { getPermissionTree } from '@/api/permission'
import type { Permission, Role } from '@/types/auth'
import type { ProFormItem, ProTableColumn } from '@/types/pro'

type RoleFormValues = {
  name: string
  code: string
  description: string
  permissionIds: string[]
}

type PermissionOption = {
  label: string
  value: string
  children?: PermissionOption[]
}


const tableRef = ref<{
  refresh: () => void
  reload: () => void
} | null>(null)
const formRef = ref<{
  validate: () => Promise<boolean>
  getFieldsValue: () => Record<string, any>
} | null>(null)

const modalVisible = ref(false)
const submitting = ref(false)
const editingRoleId = ref<string | null>(null)
const permissionTree = ref<Permission[]>([])
const formData = ref<RoleFormValues>(createDefaultFormValues())

const toolbarConfig = computed(() => ({
  title: $t('role.title'),
  subTitle: 'ProTable + ProForm',
  actions: ['refresh', 'density', 'columnSetting'] as Array<'refresh' | 'density' | 'columnSetting'>
}))

const permissionOptions = computed<PermissionOption[]>(() => {
  const buildOptions = (nodes: Permission[]): PermissionOption[] => {
    return nodes.map(node => ({
      label: `${node.name} (${node.code})`,
      value: node.id,
      children: node.children && node.children.length > 0 ? buildOptions(node.children) : undefined
    }))
  }
  return buildOptions(permissionTree.value)
})

const permissionMap = computed(() => {
  const map = new Map<string, Permission>()
  const traverse = (nodes: Permission[]) => {
    nodes.forEach((node) => {
      map.set(node.id, {
        ...node,
        children: node.children ? [...node.children] : undefined
      })
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  traverse(permissionTree.value)
  return map
})

const columns = computed<ProTableColumn[]>(() => [
  {
    title: $t('role.name'),
    dataIndex: 'name',
    search: true,
    searchType: 'input',
    width: 200
  },
  {
    title: $t('role.code'),
    dataIndex: 'code',
    search: true,
    searchType: 'input',
    width: 200
  },
  {
    title: $t('role.description'),
    dataIndex: 'description'
  },
  {
    title: $t('role.permissions'),
    dataIndex: 'permissionCount',
    width: 120
  },
  {
    title: $t('common.updateTime'),
    dataIndex: 'updatedAt',
    width: 200,
    valueType: 'dateTime'
  },
  {
    title: $t('common.actions'),
    dataIndex: 'action',
    width: 160,
    fixed: 'right',
    actions: [
      {
        label: $t('common.edit'),
        icon: EditOutlined,
        onClick: (record) => handleEdit(record as Role)
      },
      {
        label: $t('common.delete'),
        icon: DeleteOutlined,
        danger: true,
        confirm: $t('role.confirmDelete'),
        onClick: (record) => handleDelete(record as Role)
      }
    ]
  }
])

const formItems = computed<ProFormItem[]>(() => [
  {
    name: 'name',
    label: $t('role.name'),
    type: 'input',
    required: true
  },
  {
    name: 'code',
    label: $t('role.code'),
    type: 'input',
    required: true,
    props: {
      disabled: Boolean(editingRoleId.value)
    },
    rules: [
      { required: true, message: $t('role.codeRequired') },
      { pattern: /^[a-zA-Z0-9_.-]+$/, message: $t('role.codePattern') }
    ]
  },
  {
    name: 'description',
    label: $t('role.description'),
    type: 'textarea',
    colSpan: 2,
    props: {
      rows: 3
    }
  },
  {
    name: 'permissionIds',
    label: $t('role.permissions'),
    type: 'treeSelect',
    colSpan: 2,
    options: permissionOptions.value as any,
    props: {
      treeCheckable: true,
      allowClear: true,
      treeDefaultExpandAll: true,
      showCheckedStrategy: 'SHOW_PARENT',
      maxTagCount: 2
    },
    rules: [{ type: 'array', required: true, message: $t('role.selectPermissions') }]
  }
])

function createDefaultFormValues(): RoleFormValues {
  return {
    name: '',
    code: '',
    description: '',
    permissionIds: []
  }
}

const fetchPermissionTreeData = async () => {
  const response = await getPermissionTree()
  permissionTree.value = response.data
}

const fetchTableData = async (params: Record<string, any>) => {
  const response = await getRoleList({
    current: Number(params.current || 1),
    pageSize: Number(params.pageSize || 10),
    name: params.name?.trim() || undefined,
    code: params.code?.trim() || undefined
  })

  const list = response.data.list.map((item) => ({
    ...item,
    permissionCount: item.permissions?.length || 0
  }))

  return {
    data: list,
    total: response.data.total,
    success: true
  }
}

const refreshTable = () => {
  tableRef.value?.refresh()
}

const reloadTable = () => {
  tableRef.value?.reload()
}

const handleCreate = () => {
  editingRoleId.value = null
  formData.value = createDefaultFormValues()
  modalVisible.value = true
}

const handleEdit = (record: Role) => {
  editingRoleId.value = record.id
  formData.value = {
    name: record.name,
    code: record.code,
    description: record.description || '',
    permissionIds: (record.permissions || []).map(permission => permission.id)
  }
  modalVisible.value = true
}

const handleCancel = () => {
  modalVisible.value = false
  editingRoleId.value = null
  formData.value = createDefaultFormValues()
}

const handleDelete = async (record: Role) => {
  Modal.confirm({
    title: $t('role.deleteRole'),
    content: $t('role.confirmDelete'),
    onOk: async () => {
      await deleteRole(record.id)
      message.success($t('common.success'))
      refreshTable()
    }
  })
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) {
    return
  }

  const values = formRef.value?.getFieldsValue() || {}
  const permissionIds: string[] = values.permissionIds || []

  const selectedPermissions = permissionIds
    .map(id => permissionMap.value.get(id))
    .filter((permission): permission is Permission => Boolean(permission))

  const payload: Partial<Role> = {
    name: values.name?.trim(),
    code: values.code?.trim(),
    description: values.description?.trim(),
    permissions: selectedPermissions
  }

  submitting.value = true
  try {
    if (editingRoleId.value) {
      await updateRole(editingRoleId.value, payload)
      message.success($t('role.updateSuccess'))
      refreshTable()
    } else {
      await createRole(payload)
      message.success($t('role.createSuccess'))
      reloadTable()
    }
    modalVisible.value = false
    editingRoleId.value = null
    formData.value = createDefaultFormValues()
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await fetchPermissionTreeData()
})
</script>

<style scoped lang="scss">
.create-role-btn {
  box-shadow: 0 4px 14px rgba(24, 119, 255, 0.3);
  border: none;

  &:hover {
    box-shadow: 0 8px 18px rgba(24, 119, 255, 0.36);
    transform: translateY(-1px);
  }
}
</style>
