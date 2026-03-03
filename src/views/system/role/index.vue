<script setup lang="ts">
import type { Permission, Role } from '@/types/auth'
import type { ProFormItem, ProTableColumn } from '@/types/pro'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@antdv-next/icons'
import { computed, onMounted, ref } from 'vue'
import { getPermissionTree } from '@/api/permission'
import { createRole, deleteRole, getRoleList, updateRole } from '@/api/role'
import ProForm from '@/components/Pro/ProForm/index.vue'
import ProTable from '@/components/Pro/ProTable/index.vue'
import { useCrudModal } from '@/composables/useCrudModal'
import { $t } from '@/locales'

interface RoleFormValues {
  name: string
  code: string
  description: string
  permissionIds: string[]
}

interface PermissionOption {
  label: string
  value: string
  children?: PermissionOption[]
}

const tableRef = ref<{
  refresh: () => void
  reload: () => void
} | null>(null)

const permissionTree = ref<Permission[]>([])

const toolbarConfig = computed(() => ({
  title: $t('role.title'),
  subTitle: 'ProTable + ProForm',
  actions: ['!refresh', '!density', '!columnSetting'],
}))

const permissionOptions = computed<PermissionOption[]>(() => {
  const buildOptions = (nodes: Permission[]): PermissionOption[] => {
    return nodes.map(node => ({
      label: `${node.name} (${node.code})`,
      value: node.id,
      children: node.children && node.children.length > 0 ? buildOptions(node.children) : undefined,
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
        children: node.children ? [...node.children] : undefined,
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
    width: 200,
  },
  {
    title: $t('role.code'),
    dataIndex: 'code',
    search: true,
    searchType: 'input',
    width: 200,
  },
  {
    title: $t('role.description'),
    dataIndex: 'description',
  },
  {
    title: $t('role.permissions'),
    dataIndex: 'permissionCount',
    width: 120,
  },
  {
    title: $t('common.updateTime'),
    dataIndex: 'updatedAt',
    width: 200,
    valueType: 'dateTime',
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
        onClick: record => openEdit(record as Role),
      },
      {
        label: $t('common.delete'),
        icon: DeleteOutlined,
        danger: true,
        confirm: $t('role.confirmDelete'),
        onClick: record => handleDelete(record as Role),
      },
    ],
  },
])

// Use the CRUD modal composable
const {
  modalVisible,
  submitting,
  formRef,
  formData,
  modalTitle,
  openCreate,
  openEdit,
  closeModal,
  handleSubmit,
  handleDelete,
} = useCrudModal<Role, RoleFormValues>({
  defaultFormValues: () => ({
    name: '',
    code: '',
    description: '',
    permissionIds: [],
  }),
  formItems: computed<ProFormItem[]>(() => [
    {
      name: 'name',
      label: $t('role.name'),
      type: 'input',
      required: true,
    },
    {
      name: 'code',
      label: $t('role.code'),
      type: 'input',
      required: true,
      props: {
        disabled: false, // Will be set dynamically based on editing state
      },
      rules: [
        { required: true, message: $t('role.codeRequired') },
        { pattern: /^[\w.-]+$/, message: $t('role.codePattern') },
      ],
    },
    {
      name: 'description',
      label: $t('role.description'),
      type: 'textarea',
      colSpan: 2,
      props: {
        rows: 3,
      },
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
        maxTagCount: 2,
      },
      rules: [{ type: 'array', required: true, message: $t('role.selectPermissions') }],
    },
  ]),
  createApi: async (data) => {
    const result = await createRole(data)
    return { success: result.success, message: $t('role.createSuccess') }
  },
  updateApi: async (id, data) => {
    const result = await updateRole(id, data)
    return { success: result.success, message: $t('role.updateSuccess') }
  },
  deleteApi: async (id) => {
    const result = await deleteRole(id)
    return { success: result.success }
  },
  transformFormValues: (values) => {
    const permissionIds: string[] = values.permissionIds || []
    const selectedPermissions = permissionIds
      .map(id => permissionMap.value.get(id))
      .filter((permission): permission is Permission => Boolean(permission))

    return {
      name: values.name?.trim(),
      code: values.code?.trim(),
      description: values.description?.trim(),
      permissions: selectedPermissions,
    }
  },
  transformRecordToForm: record => ({
    name: record.name,
    code: record.code,
    description: record.description || '',
    permissionIds: (record.permissions || []).map(permission => permission.id),
  }),
  createTitle: $t('role.createRole'),
  editTitle: $t('role.editRole'),
  deleteConfirmMessage: $t('role.confirmDelete'),
  onCreated: () => tableRef.value?.reload(),
  onUpdated: () => tableRef.value?.refresh(),
  onDeleted: () => tableRef.value?.reload(),
})

async function fetchPermissionTreeData() {
  const response = await getPermissionTree()
  permissionTree.value = response.data
}

async function fetchTableData(params: Record<string, any>) {
  const response = await getRoleList({
    current: Number(params.current || 1),
    pageSize: Number(params.pageSize || 10),
    name: params.name?.trim() || undefined,
    code: params.code?.trim() || undefined,
  })

  const list = response.data.list.map(item => ({
    ...item,
    permissionCount: item.permissions?.length || 0,
  }))

  return {
    data: list,
    total: response.data.total,
    success: true,
  }
}

onMounted(async () => {
  await fetchPermissionTreeData()
})
</script>

<template>
  <div class="page-container">
    <ProTable
      ref="tableRef"
      :columns="columns"
      :request="fetchTableData"
      :toolbar="toolbarConfig"
      :search="{
        labelWidth: 6,
        defaultCollapsed: true,
      }"
      row-key="id"
    >
      <template #toolbar-actions>
        <a-button type="primary" class="create-role-btn" @click="openCreate()">
          <PlusOutlined /> {{ $t('role.createRole') }}
        </a-button>
      </template>
    </ProTable>

    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :confirm-loading="submitting"
      width="820px"
      @ok="handleSubmit"
      @cancel="closeModal"
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
