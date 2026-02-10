<template>
  <div class="page-container">
    <div class="card page-card">
      <a-form :model="searchForm" layout="inline" class="filter-form">
        <a-form-item :label="$t('user.username')">
          <a-input
            v-model:value="searchForm.username"
            :placeholder="$t('user.username')"
            allow-clear
          />
        </a-form-item>

        <a-form-item :label="$t('user.email')">
          <a-input
            v-model:value="searchForm.email"
            :placeholder="$t('user.email')"
            allow-clear
          />
        </a-form-item>

        <a-form-item :label="$t('user.status')">
          <a-select
            v-model:value="searchForm.status"
            style="width: 140px"
            allow-clear
            :options="statusOptions"
          />
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
              {{ $t('user.createUser') }}
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table
        row-key="id"
        :loading="loading"
        :columns="columns"
        :data-source="userList"
        :pagination="pagination"
        size="middle"
        class="user-table"
        :scroll="{ x: 1100 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'roles'">
            <span>{{ formatRoleNames(record.roles) }}</span>
          </template>

          <template v-else-if="column.key === 'gender'">
            <a-tag class="gender-tag" :color="record.gender === 'male' ? 'blue' : 'magenta'">
              <ManOutlined v-if="record.gender === 'male'" />
              <WomanOutlined v-else />
              {{ genderTextMap[record.gender] || '-' }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag class="status-tag" :color="record.status === 'active' ? 'success' : 'default'">
              {{ record.status === 'active' ? $t('user.active') : $t('user.inactive') }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'createdAt'">
            <span>{{ formatDate(record.createdAt) }}</span>
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
      :title="editingUserId ? $t('user.editUser') : $t('user.createUser')"
      :confirm-loading="submitting"
      width="760px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formModel"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="username" :label="$t('user.username')">
              <a-input v-model:value="formModel.username" :disabled="Boolean(editingUserId)" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="realName" :label="$t('user.realName')">
              <a-input v-model:value="formModel.realName" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="email" :label="$t('user.email')">
              <a-input v-model:value="formModel.email" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="phone" :label="$t('user.phone')">
              <a-input v-model:value="formModel.phone" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="gender" :label="$t('user.gender')">
              <a-radio-group v-model:value="formModel.gender">
                <a-radio value="male">{{ $t('user.male') }}</a-radio>
                <a-radio value="female">{{ $t('user.female') }}</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="status" :label="$t('user.status')">
              <a-select v-model:value="formModel.status" :options="statusOptions" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item name="roleIds" :label="$t('user.role')">
              <a-select
                v-model:value="formModel.roleIds"
                mode="multiple"
                :options="roleSelectOptions"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item name="bio" label="个人简介">
              <a-textarea v-model:value="formModel.bio" :rows="3" :maxlength="200" show-count />
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
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ManOutlined,
  WomanOutlined
} from '@antdv-next/icons'
import { useI18n } from 'vue-i18n'
import { createUser, deleteUser, getUserList, updateUser } from '@/api/user'
import { getRoleList } from '@/api/role'
import type { Role, User } from '@/types/auth'

interface UserSearchForm {
  username: string
  email: string
  status?: 'active' | 'inactive'
}

interface UserFormModel {
  username: string
  realName: string
  email: string
  phone: string
  gender: 'male' | 'female'
  status: 'active' | 'inactive'
  roleIds: string[]
  bio: string
}

interface TablePagination {
  current?: number
  pageSize?: number
}

interface UserFormRef {
  validate: () => Promise<void>
  resetFields: () => void
}

const { t } = useI18n()

const loading = ref(false)
const submitting = ref(false)
const formOpen = ref(false)
const editingUserId = ref<string | null>(null)
const userList = ref<User[]>([])
const roleOptions = ref<Role[]>([])
const formRef = ref<UserFormRef | null>(null)

const pager = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const searchForm = reactive<UserSearchForm>({
  username: '',
  email: '',
  status: undefined
})

const createDefaultForm = (): UserFormModel => ({
  username: '',
  realName: '',
  email: '',
  phone: '',
  gender: 'male',
  status: 'active',
  roleIds: [],
  bio: ''
})

const formModel = reactive<UserFormModel>(createDefaultForm())

const columns = [
  { title: t('user.username'), dataIndex: 'username', key: 'username', width: 140 },
  { title: t('user.realName'), dataIndex: 'realName', key: 'realName', width: 140 },
  { title: t('user.email'), dataIndex: 'email', key: 'email', width: 200 },
  { title: t('user.phone'), dataIndex: 'phone', key: 'phone', width: 140 },
  { title: t('user.role'), dataIndex: 'roles', key: 'roles', width: 180 },
  { title: t('user.gender'), dataIndex: 'gender', key: 'gender', width: 100 },
  { title: t('user.status'), dataIndex: 'status', key: 'status', width: 120 },
  { title: t('common.createTime'), dataIndex: 'createdAt', key: 'createdAt', width: 200 },
  { title: t('common.actions'), key: 'action', width: 120, fixed: 'right' }
]

const statusOptions = [
  { label: t('user.active'), value: 'active' },
  { label: t('user.inactive'), value: 'inactive' }
]

const genderTextMap: Record<string, string> = {
  male: t('user.male'),
  female: t('user.female')
}

const roleSelectOptions = computed(() => {
  return roleOptions.value.map(role => ({
    label: role.name,
    value: role.id
  }))
})

const pagination = computed(() => ({
  current: pager.current,
  pageSize: pager.pageSize,
  total: pager.total,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`
}))

const formRules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度应在 3-20 之间' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email' as const, message: t('validation.email') }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: t('validation.phone') }
  ],
  roleIds: [
    { type: 'array' as const, required: true, message: '请选择至少一个角色' }
  ]
}

const formatDate = (value: string) => {
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

const formatRoleNames = (roles: Role[]) => {
  if (!roles || roles.length === 0) {
    return '-'
  }
  return roles.map(role => role.name).join(', ')
}

const resetFormModel = () => {
  Object.assign(formModel, createDefaultForm())
}

const fetchRoleOptions = async () => {
  const response = await getRoleList({ current: 1, pageSize: 200 })
  roleOptions.value = response.data.list
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await getUserList({
      current: pager.current,
      pageSize: pager.pageSize,
      username: searchForm.username.trim() || undefined,
      email: searchForm.email.trim() || undefined,
      status: searchForm.status
    })
    userList.value = response.data.list
    pager.total = response.data.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pager.current = 1
  fetchUsers()
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.email = ''
  searchForm.status = undefined
  pager.current = 1
  fetchUsers()
}

const handleTableChange = (paginationData: TablePagination) => {
  pager.current = paginationData.current || 1
  pager.pageSize = paginationData.pageSize || 10
  fetchUsers()
}

const openCreate = () => {
  editingUserId.value = null
  resetFormModel()
  formOpen.value = true
  formRef.value?.resetFields()
}

const openEdit = (record: User) => {
  editingUserId.value = record.id
  Object.assign(formModel, {
    username: record.username,
    realName: record.realName,
    email: record.email,
    phone: record.phone,
    gender: record.gender || 'male',
    status: record.status,
    roleIds: record.roles.map(role => role.id),
    bio: record.bio || ''
  })
  formOpen.value = true
}

const handleCancel = () => {
  formOpen.value = false
  resetFormModel()
}

const handleDelete = (record: User) => {
  Modal.confirm({
    title: t('user.deleteUser'),
    content: t('user.confirmDelete'),
    onOk: async () => {
      await deleteUser(record.id)
      message.success(t('common.success'))
      if (userList.value.length === 1 && pager.current > 1) {
        pager.current -= 1
      }
      await fetchUsers()
    }
  })
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const selectedRoles = roleOptions.value.filter(role => formModel.roleIds.includes(role.id))
  const payload: Partial<User> = {
    username: formModel.username.trim(),
    realName: formModel.realName.trim(),
    email: formModel.email.trim(),
    phone: formModel.phone.trim(),
    gender: formModel.gender,
    status: formModel.status,
    bio: formModel.bio.trim(),
    roles: selectedRoles
  }

  submitting.value = true
  try {
    if (editingUserId.value) {
      await updateUser(editingUserId.value, payload)
      message.success('用户更新成功')
    } else {
      await createUser(payload)
      message.success('用户创建成功')
      pager.current = 1
    }
    formOpen.value = false
    resetFormModel()
    await fetchUsers()
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchRoleOptions(), fetchUsers()])
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

.user-table {
  padding: 10px 16px 16px;

  :deep(.ant-table) {
    background: transparent;
  }

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

  :deep(.ant-table-tbody > tr > td) {
    border-bottom-color: var(--color-border-secondary);
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background: var(--color-bg-layout) !important;
  }

  .gender-tag,
  .status-tag {
    border-radius: 999px;
    padding-inline: 10px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
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

  .user-table {
    .row-actions {
      opacity: 1;
      transform: none;
    }
  }
}
</style>
