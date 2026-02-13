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
        <a-space>
          <a-upload
            :show-upload-list="false"
            accept=".csv"
            :before-upload="handleImport"
          >
            <a-button>
              <UploadOutlined /> {{ $t('common.import') }}
            </a-button>
          </a-upload>
          <a-button @click="handleExport">
            <DownloadOutlined /> {{ $t('common.export') }}
          </a-button>
          <a-button type="primary" class="create-user-btn" @click="handleCreate">
            <PlusOutlined /> {{ $t('user.createUser') }}
          </a-button>
        </a-space>
      </template>
    </ProTable>

    <a-modal
      v-model:open="modalVisible"
      :title="editingUserId ? $t('user.editUser') : $t('user.createUser')"
      :confirm-loading="submitting"
      width="760px"
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
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined } from '@antdv-next/icons'
import { $t } from '@/locales'
import ProTable from '@/components/Pro/ProTable/index.vue'
import ProForm from '@/components/Pro/ProForm/index.vue'
import { createUser, deleteUser, getUserList, updateUser } from '@/api/user'
import { getRoleList } from '@/api/role'
import type { Role, User } from '@/types/auth'
import type { ProFormItem, ProTableColumn } from '@/types/pro'
import { exportToCSV, parseCSV } from '@/utils/export'

type UserFormValues = {
  username: string
  realName: string
  email: string
  phone: string
  gender: 'male' | 'female'
  status: 'active' | 'inactive'
  roleIds: string[]
  bio: string
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
const editingUserId = ref<string | null>(null)
const roleOptions = ref<Role[]>([])
const formData = ref<UserFormValues>(createDefaultFormValues())

const toolbarConfig = computed(() => ({
  title: $t('user.title'),
  subTitle: 'ProTable + ProForm',
  actions: ['refresh', 'density', 'columnSetting'] as Array<'refresh' | 'density' | 'columnSetting'>
}))

const statusOptions = computed(() => [
  { label: $t('user.active'), value: 'active' },
  { label: $t('user.inactive'), value: 'inactive' }
])

const genderOptions = computed(() => [
  { label: $t('user.male'), value: 'male' },
  { label: $t('user.female'), value: 'female' }
])

const roleSelectOptions = computed(() => {
  return roleOptions.value.map(role => ({
    label: role.name,
    value: role.id
  }))
})

const genderValueEnum = computed<Record<string, { text: string; status?: string; color?: string }>>(() => ({
  male: { text: $t('user.male'), color: 'blue' },
  female: { text: $t('user.female'), color: 'magenta' }
}))

const statusValueEnum = computed<Record<string, { text: string; status?: string; color?: string }>>(() => ({
  active: { text: $t('user.active'), status: 'success' },
  inactive: { text: $t('user.inactive'), status: 'default' }
}))

const columns = computed((): ProTableColumn[] => [
  {
    title: $t('user.username'),
    dataIndex: 'username',
    search: true,
    searchType: 'input',
    width: 150,
    fixed: 'left'
  },
  {
    title: $t('user.realName'),
    dataIndex: 'realName',
    width: 140
  },
  {
    title: $t('user.email'),
    dataIndex: 'email',
    search: true,
    searchType: 'input',
    width: 220
  },
  {
    title: $t('user.phone'),
    dataIndex: 'phone',
    width: 150
  },
  {
    title: $t('user.role'),
    dataIndex: 'roleNames',
    width: 220
  },
  {
    title: $t('user.gender'),
    dataIndex: 'gender',
    width: 100,
    valueType: 'tag',
    valueEnum: genderValueEnum.value
  },
  {
    title: $t('user.status'),
    dataIndex: 'status',
    search: true,
    searchType: 'select',
    searchOptions: statusOptions.value,
    width: 120,
    valueType: 'badge',
    valueEnum: statusValueEnum.value
  },
  {
    title: $t('common.createTime'),
    dataIndex: 'createdAt',
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
        onClick: (record) => handleEdit(record as User)
      },
      {
        label: $t('common.delete'),
        icon: DeleteOutlined,
        danger: true,
        confirm: $t('user.confirmDelete'),
        onClick: (record) => handleDelete(record as User)
      }
    ]
  }
])

const formItems = computed<ProFormItem[]>(() => [
  {
    name: 'username',
    label: $t('user.username'),
    type: 'input',
    required: true,
    props: {
      disabled: Boolean(editingUserId.value)
    },
    rules: [
      { required: true, message: $t('user.usernameRequired') },
      { min: 3, max: 20, message: $t('user.usernameLength') }
    ]
  },
  {
    name: 'realName',
    label: $t('user.realName'),
    type: 'input',
    required: true
  },
  {
    name: 'email',
    label: $t('user.email'),
    type: 'input',
    required: true,
    rules: [
      { required: true, message: $t('user.emailRequired') },
      { type: 'email', message: $t('validation.email') }
    ]
  },
  {
    name: 'phone',
    label: $t('user.phone'),
    type: 'input',
    rules: [{ pattern: /^1[3-9]\d{9}$/, message: $t('validation.phone') }]
  },
  {
    name: 'gender',
    label: $t('user.gender'),
    type: 'radio',
    options: genderOptions.value
  },
  {
    name: 'status',
    label: $t('user.status'),
    type: 'radio',
    options: statusOptions.value,
    required: true
  },
  {
    name: 'roleIds',
    label: $t('user.role'),
    type: 'select',
    options: roleSelectOptions.value,
    props: {
      mode: 'multiple',
      allowClear: true
    },
    rules: [{ type: 'array', required: true, message: $t('user.selectRole') }]
  },
  {
    name: 'bio',
    label: $t('user.bio'),
    type: 'textarea',
    colSpan: 2,
    props: {
      rows: 3,
      maxLength: 200,
      showCount: true
    }
  }
])

function createDefaultFormValues(): UserFormValues {
  return {
    username: '',
    realName: '',
    email: '',
    phone: '',
    gender: 'male',
    status: 'active',
    roleIds: [],
    bio: ''
  }
}

const formatRoleNames = (roles: Role[]) => {
  if (!roles || roles.length === 0) {
    return '-'
  }
  return roles.map(role => role.name).join(', ')
}

const fetchTableData = async (params: Record<string, any>) => {
  const response = await getUserList({
    current: Number(params.current || 1),
    pageSize: Number(params.pageSize || 10),
    username: params.username?.trim() || undefined,
    email: params.email?.trim() || undefined,
    status: params.status
  })

  const list = response.data.list.map((item) => ({
    ...item,
    roleNames: formatRoleNames(item.roles)
  }))

  return {
    data: list,
    total: response.data.total,
    success: true
  }
}

const fetchRoleOptions = async () => {
  const response = await getRoleList({ current: 1, pageSize: 200 })
  roleOptions.value = response.data.list
}

const refreshTable = () => {
  tableRef.value?.refresh()
}

const reloadTable = () => {
  tableRef.value?.reload()
}

const handleCreate = () => {
  editingUserId.value = null
  formData.value = createDefaultFormValues()
  modalVisible.value = true
}

const handleEdit = (record: User) => {
  editingUserId.value = record.id
  formData.value = {
    username: record.username,
    realName: record.realName,
    email: record.email,
    phone: record.phone,
    gender: record.gender || 'male',
    status: record.status || 'active',
    roleIds: (record.roles || []).map(role => role.id),
    bio: record.bio || ''
  }
  modalVisible.value = true
}

const handleCancel = () => {
  modalVisible.value = false
  editingUserId.value = null
  formData.value = createDefaultFormValues()
}

const handleDelete = async (record: User) => {
  Modal.confirm({
    title: $t('user.deleteUser'),
    content: $t('user.confirmDelete'),
    onOk: async () => {
      await deleteUser(record.id)
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
  const selectedRoles = roleOptions.value.filter(role => values.roleIds?.includes(role.id))

  const payload: Partial<User> = {
    username: values.username?.trim(),
    realName: values.realName?.trim(),
    email: values.email?.trim(),
    phone: values.phone?.trim(),
    gender: values.gender,
    status: values.status,
    bio: values.bio?.trim(),
    roles: selectedRoles
  }

  submitting.value = true
  try {
    if (editingUserId.value) {
      await updateUser(editingUserId.value, payload)
      message.success($t('user.updateSuccess'))
      refreshTable()
    } else {
      await createUser(payload)
      message.success($t('user.createSuccess'))
      reloadTable()
    }
    modalVisible.value = false
    editingUserId.value = null
    formData.value = createDefaultFormValues()
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await fetchRoleOptions()
})

// 导出用户数据
const handleExport = async () => {
  try {
    const response = await getUserList({ current: 1, pageSize: 9999 })
    const list = response.data.list
    exportToCSV(
      [
        { title: $t('user.username'), dataIndex: 'username' },
        { title: $t('user.realName'), dataIndex: 'realName' },
        { title: $t('user.email'), dataIndex: 'email' },
        { title: $t('user.phone'), dataIndex: 'phone' },
        { title: $t('user.gender'), dataIndex: 'gender', render: (v: string) => v === 'male' ? $t('user.male') : $t('user.female') },
        { title: $t('user.status'), dataIndex: 'status', render: (v: string) => v === 'active' ? $t('user.active') : $t('user.inactive') },
        { title: $t('user.role'), dataIndex: 'roles', render: (_: any, r: any) => (r.roles || []).map((role: any) => role.name).join(', ') },
        { title: $t('common.createTime'), dataIndex: 'createdAt' }
      ],
      list,
      `${$t('user.title')}_${new Date().toISOString().slice(0, 10)}`
    )
    message.success($t('user.exportSuccess'))
  } catch {
    message.error($t('user.exportFailed'))
  }
}

// 导入用户数据
const handleImport = async (file: File) => {
  try {
    const rows = await parseCSV(file)
    if (rows.length < 2) {
      message.warning($t('user.importEmpty'))
      return false
    }
    const header = rows[0]
    const usernameIdx = header.findIndex(h => h.includes('用户名'))
    const realNameIdx = header.findIndex(h => h.includes('姓名'))
    const emailIdx = header.findIndex(h => h.includes('邮箱'))

    if (usernameIdx === -1 || realNameIdx === -1 || emailIdx === -1) {
      message.error($t('user.importFormatError'))
      return false
    }

    let successCount = 0
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row[usernameIdx]) continue
      try {
        await createUser({
          username: row[usernameIdx],
          realName: row[realNameIdx] || '',
          email: row[emailIdx] || '',
          status: 'active'
        })
        successCount++
      } catch { /* skip duplicates */ }
    }
    message.success($t('user.importSuccess', { count: successCount }))
    refreshTable()
  } catch {
    message.error($t('user.importFailed'))
  }
  return false
}
</script>

<style scoped lang="scss">
.create-user-btn {
  box-shadow: 0 4px 14px rgba(24, 119, 255, 0.3);
  border: none;

  &:hover {
    box-shadow: 0 8px 18px rgba(24, 119, 255, 0.36);
    transform: translateY(-1px);
  }
}
</style>
