<template>
  <div class="page-container">
    <ProTable
      ref="tableRef"
      :columns="columns"
      :request="fetchTableData"
      :toolbar="toolbarConfig"
      :search="{
        labelWidth: 6,
        defaultCollapsed: false
      }"
      :pagination="false"
      row-key="id"
      :expanded-row-keys="expandedRowKeys"
      :children-column-name="'children'"
      @expanded-rows-change="handleExpandedRowsChange"
    >
      <template #toolbar-actions>
        <a-space :size="8">
          <a-button type="primary" class="create-permission-btn" @click="handleCreateRoot">
            <PlusOutlined /> {{ $t('permission.createPermission') }}
          </a-button>
          <a-button @click="expandAllRows">展开全部</a-button>
          <a-button @click="collapseAllRows">收起全部</a-button>
        </a-space>
      </template>
    </ProTable>

    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :confirm-loading="submitting"
      width="760px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-alert v-if="currentParentName" type="info" show-icon style="margin-bottom: 12px">
        <template #message>
          上级菜单：{{ currentParentName }}
        </template>
      </a-alert>

      <ProForm
        ref="formRef"
        :form-items="formItems"
        :initial-values="formData"
        :grid="{ cols: 2, gutter: 16 }"
        :layout="{ layout: 'vertical' }"
        @values-change="handleFormValuesChange"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message, Modal } from 'antdv-next'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@antdv-next/icons'
import { useI18n } from 'vue-i18n'
import ProTable from '@/components/Pro/ProTable/index.vue'
import ProForm from '@/components/Pro/ProForm/index.vue'
import {
  createPermission,
  deletePermission,
  getPermissionList,
  updatePermission
} from '@/api/permission'
import type { Permission } from '@/types/auth'
import type { ProFormItem, ProTableColumn } from '@/types/pro'

type PermissionFormValues = {
  name: string
  code: string
  type: Permission['type']
  description: string
  parentId?: string
  path: string
  component: string
  icon: string
  sort: number
  status: 'active' | 'inactive'
  visible: boolean
  resource: string
  action: string
}

type PermissionMode = 'create' | 'edit'

const { t } = useI18n()

const tableRef = ref<{
  refresh: () => void
} | null>(null)
const formRef = ref<{
  validate: () => Promise<boolean>
  getFieldsValue: () => Record<string, any>
} | null>(null)

const modalVisible = ref(false)
const submitting = ref(false)
const modalMode = ref<PermissionMode>('create')
const editingPermissionId = ref<string | null>(null)

const menuTree = ref<Permission[]>([])
const expandedRowKeys = ref<string[]>([])
const keepExpandAll = ref(true)

const formData = ref<PermissionFormValues>(createDefaultFormValues())
const formValues = ref<PermissionFormValues>(createDefaultFormValues())

const toolbarConfig = computed(() => ({
  title: t('permission.title'),
  subTitle: 'ProTable + ProForm',
  actions: ['refresh', 'density', 'columnSetting'] as Array<'refresh' | 'density' | 'columnSetting'>
}))

const permissionTypeOptions = computed(() => [
  { label: t('permission.menu'), value: 'menu' },
  { label: t('permission.button'), value: 'button' },
  { label: t('permission.api'), value: 'api' }
])

const statusOptions = computed(() => [
  { label: t('user.active'), value: 'active' },
  { label: t('user.inactive'), value: 'inactive' }
])

const currentType = computed(() => formValues.value.type || 'menu')

const modalTitle = computed(() => {
  if (modalMode.value === 'edit') {
    return t('permission.editPermission')
  }
  return formValues.value.parentId ? '新增子菜单' : t('permission.createPermission')
})

const currentParentName = computed(() => {
  if (!formValues.value.parentId) {
    return ''
  }
  return findPermissionName(menuTree.value, formValues.value.parentId) || '-'
})

const permissionTypeValueEnum = computed<Record<string, { text: string; status?: string; color?: string }>>(() => ({
  menu: { text: t('permission.menu'), color: 'processing' },
  button: { text: t('permission.button'), color: 'success' },
  api: { text: t('permission.api'), color: 'purple' }
}))

const permissionStatusValueEnum = computed<Record<string, { text: string; status?: string; color?: string }>>(() => ({
  active: { text: t('user.active'), status: 'success' },
  inactive: { text: t('user.inactive'), status: 'default' }
}))

const permissionVisibleValueEnum = computed<Record<string, { text: string; status?: string; color?: string }>>(() => ({
  true: { text: '显示', color: 'blue' },
  false: { text: '隐藏', color: 'default' }
}))

const columns = computed((): ProTableColumn[] => [
  {
    title: t('common.search'),
    dataIndex: 'keyword',
    search: true,
    searchType: 'input',
    hideInTable: true
  },
  {
    title: t('permission.name'),
    dataIndex: 'name',
    width: 220
  },
  {
    title: t('permission.code'),
    dataIndex: 'code',
    width: 220
  },
  {
    title: t('permission.type'),
    dataIndex: 'type',
    search: true,
    searchType: 'select',
    searchOptions: permissionTypeOptions.value,
    width: 120,
    valueType: 'tag',
    valueEnum: permissionTypeValueEnum.value
  },
  {
    title: '路由路径',
    dataIndex: 'path',
    width: 170
  },
  {
    title: '组件路径',
    dataIndex: 'component',
    width: 220
  },
  {
    title: t('common.status'),
    dataIndex: 'status',
    search: true,
    searchType: 'select',
    searchOptions: statusOptions.value,
    width: 120,
    valueType: 'badge',
    valueEnum: permissionStatusValueEnum.value
  },
  {
    title: '显示',
    dataIndex: 'visible',
    width: 100,
    valueType: 'tag',
    valueEnum: permissionVisibleValueEnum.value
  },
  {
    title: '排序',
    dataIndex: 'sort',
    width: 90
  },
  {
    title: t('common.actions'),
    dataIndex: 'action',
    width: 220,
    fixed: 'right',
    actions: [
      {
        label: '新增子级',
        icon: PlusOutlined,
        hidden: (record) => (record as Permission).type !== 'menu',
        onClick: (record) => handleCreateChild(record as Permission)
      },
      {
        label: t('common.edit'),
        icon: EditOutlined,
        onClick: (record) => handleEdit(record as Permission)
      },
      {
        label: t('common.delete'),
        icon: DeleteOutlined,
        danger: true,
        confirm: t('permission.confirmDelete'),
        onClick: (record) => handleDelete(record as Permission)
      }
    ]
  }
])

const formItems = computed<ProFormItem[]>(() => [
  {
    name: 'name',
    label: t('permission.name'),
    type: 'input',
    required: true
  },
  {
    name: 'code',
    label: t('permission.code'),
    type: 'input',
    required: true,
    props: {
      disabled: Boolean(editingPermissionId.value)
    },
    rules: [
      { required: true, message: '请输入权限编码' },
      { pattern: /^[a-zA-Z0-9_.-]+$/, message: '权限编码仅支持字母、数字、下划线和中划线' }
    ]
  },
  {
    name: 'type',
    label: t('permission.type'),
    type: 'select',
    options: permissionTypeOptions.value,
    required: true
  },
  {
    name: 'status',
    label: t('common.status'),
    type: 'radio',
    options: statusOptions.value
  },
  {
    name: 'path',
    label: '路由路径',
    type: 'input',
    hidden: currentType.value !== 'menu',
    rules: [{
      validator: (_rule: any, value: any) => {
        if (currentType.value === 'menu' && !String(value || '').trim()) {
          return Promise.reject(new Error('菜单类型必须填写路由路径'))
        }
        return Promise.resolve()
      }
    }]
  },
  {
    name: 'component',
    label: '组件路径',
    type: 'input',
    hidden: currentType.value !== 'menu'
  },
  {
    name: 'icon',
    label: '图标',
    type: 'input',
    hidden: currentType.value !== 'menu',
    placeholder: '例如：UserOutlined'
  },
  {
    name: 'sort',
    label: '排序',
    type: 'number',
    hidden: currentType.value !== 'menu',
    props: {
      min: 0
    }
  },
  {
    name: 'resource',
    label: t('permission.resource'),
    type: 'input'
  },
  {
    name: 'action',
    label: t('permission.action'),
    type: 'input'
  },
  {
    name: 'description',
    label: t('role.description'),
    type: 'textarea',
    colSpan: 2,
    props: {
      rows: 3
    }
  },
  {
    name: 'visible',
    label: '显示状态',
    type: 'switch',
    colSpan: 2,
    valuePropName: 'checked',
    props: {
      checkedChildren: '显示',
      unCheckedChildren: '隐藏'
    }
  }
])

function createDefaultFormValues(): PermissionFormValues {
  return {
    name: '',
    code: '',
    type: 'menu',
    description: '',
    parentId: undefined,
    path: '',
    component: '',
    icon: '',
    sort: 0,
    status: 'active',
    visible: true,
    resource: '',
    action: 'view'
  }
}

function normalizePath(path: string) {
  if (!path) {
    return ''
  }
  return path.startsWith('/') ? path : `/${path}`
}

function collectPermissionIds(list: Permission[]): string[] {
  const ids: string[] = []
  list.forEach((item) => {
    ids.push(item.id)
    if (item.children && item.children.length > 0) {
      ids.push(...collectPermissionIds(item.children))
    }
  })
  return ids
}

function findPermissionName(list: Permission[], id: string): string {
  for (const item of list) {
    if (item.id === id) {
      return item.name
    }
    if (item.children && item.children.length > 0) {
      const childName = findPermissionName(item.children, id)
      if (childName) {
        return childName
      }
    }
  }
  return ''
}

const fetchTableData = async (params: Record<string, any>) => {
  const response = await getPermissionList({
    keyword: params.keyword?.trim() || undefined,
    type: params.type || undefined,
    status: params.status || undefined
  })

  menuTree.value = response.data
  const allIds = collectPermissionIds(menuTree.value)

  if (keepExpandAll.value) {
    expandedRowKeys.value = allIds
  } else {
    expandedRowKeys.value = expandedRowKeys.value.filter(id => allIds.includes(String(id)))
  }

  return {
    data: response.data,
    total: allIds.length,
    success: true
  }
}

const refreshTable = () => {
  tableRef.value?.refresh()
}

const handleExpandedRowsChange = (keys: string[]) => {
  expandedRowKeys.value = keys
  const allIds = collectPermissionIds(menuTree.value)
  keepExpandAll.value = keys.length === allIds.length
}

const expandAllRows = () => {
  expandedRowKeys.value = collectPermissionIds(menuTree.value)
  keepExpandAll.value = true
}

const collapseAllRows = () => {
  expandedRowKeys.value = []
  keepExpandAll.value = false
}

const handleCreateRoot = () => {
  modalMode.value = 'create'
  editingPermissionId.value = null
  const initialValues = createDefaultFormValues()
  formData.value = initialValues
  formValues.value = initialValues
  modalVisible.value = true
}

const handleCreateChild = (record: Permission) => {
  modalMode.value = 'create'
  editingPermissionId.value = null
  const initialValues = {
    ...createDefaultFormValues(),
    parentId: record.id,
    type: 'menu' as const,
    resource: record.path || '',
    action: 'view'
  }
  formData.value = initialValues
  formValues.value = initialValues
  modalVisible.value = true
}

const handleEdit = (record: Permission) => {
  modalMode.value = 'edit'
  editingPermissionId.value = record.id
  const initialValues: PermissionFormValues = {
    name: record.name,
    code: record.code,
    type: record.type,
    description: record.description || '',
    parentId: record.parentId,
    path: record.path || '',
    component: record.component || '',
    icon: record.icon || '',
    sort: record.sort ?? 0,
    status: record.status || 'active',
    visible: record.visible !== false,
    resource: record.resource || '',
    action: record.action || (record.type === 'menu' ? 'view' : '*')
  }
  formData.value = initialValues
  formValues.value = initialValues
  modalVisible.value = true
}

const handleCancel = () => {
  modalVisible.value = false
  editingPermissionId.value = null
  const initialValues = createDefaultFormValues()
  formData.value = initialValues
  formValues.value = initialValues
}

const handleDelete = async (record: Permission) => {
  Modal.confirm({
    title: t('permission.deletePermission'),
    content: t('permission.confirmDelete'),
    onOk: async () => {
      await deletePermission(record.id)
      message.success(t('common.success'))
      refreshTable()
    }
  })
}

const handleFormValuesChange = (values: Record<string, any>) => {
  formValues.value = {
    ...formValues.value,
    ...values
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) {
    return
  }

  const values = formRef.value?.getFieldsValue() || {}

  const payload: Partial<Permission> = {
    name: values.name?.trim(),
    code: values.code?.trim(),
    type: values.type,
    description: values.description?.trim(),
    parentId: values.parentId,
    status: values.status,
    visible: values.visible,
    sort: Number(values.sort ?? 0),
    path: values.type === 'menu' ? normalizePath(values.path?.trim()) : undefined,
    component: values.type === 'menu' ? values.component?.trim() || undefined : undefined,
    icon: values.type === 'menu' ? values.icon?.trim() || undefined : undefined,
    resource: values.resource?.trim() || normalizePath(values.path?.trim()) || values.code?.trim(),
    action: values.action?.trim() || (values.type === 'menu' ? 'view' : '*')
  }

  submitting.value = true
  try {
    if (modalMode.value === 'edit' && editingPermissionId.value) {
      await updatePermission(editingPermissionId.value, payload)
      message.success('菜单更新成功')
    } else {
      await createPermission(payload)
      message.success('菜单创建成功')
    }
    modalVisible.value = false
    editingPermissionId.value = null
    const initialValues = createDefaultFormValues()
    formData.value = initialValues
    formValues.value = initialValues
    refreshTable()
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.create-permission-btn {
  box-shadow: 0 4px 14px rgba(24, 119, 255, 0.3);
  border: none;

  &:hover {
    box-shadow: 0 8px 18px rgba(24, 119, 255, 0.36);
    transform: translateY(-1px);
  }
}
</style>
