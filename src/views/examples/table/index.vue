<template>
  <div class="page-container">
    <ProTable
      :columns="columns"
      :request="fetchData"
      :toolbar="{
        title: $t('exampleTable.userList'),
        subTitle: $t('exampleTable.subTitle'),
        actions: ['refresh', 'columnSetting']
      }"
      :search="{
        labelWidth: 80,
        defaultCollapsed: true
      }"
      row-key="id"
    >
      <template #toolbar-actions>
        <a-button type="primary" class="create-user-btn" @click="handleCreate">
          <PlusOutlined /> {{ $t('exampleTable.createUser') }}
        </a-button>
      </template>

      <!-- 自定义筛选图标 -->
      <template #filterIcon="{ filtered, column }">
        <SearchOutlined v-if="column.dataIndex === 'username'" :style="{ color: filtered ? '#1677ff' : undefined }" />
      </template>

      <!-- 自定义筛选下拉框（用于用户名搜索） -->
      <template #filterDropdown="{ column, setSelectedKeys, selectedKeys, confirm, clearFilters }">
        <div v-if="column.dataIndex === 'username'" style="padding: 8px" @keydown.stop>
          <a-input
            ref="searchInput"
            :placeholder="`搜索${column.title}`"
            :value="selectedKeys[0]"
            style="width: 188px; margin-bottom: 8px; display: block"
            @update:value="value => setSelectedKeys(value ? [value] : [])"
            @keydown.enter="handleSearch(selectedKeys, confirm, 'username')"
          />
          <a-space>
            <a-button
              type="primary"
              size="small"
              style="width: 90px"
              @click="handleSearch(selectedKeys, confirm, 'username')"
            >
              搜索
            </a-button>
            <a-button
              size="small"
              style="width: 90px"
              @click="handleReset(clearFilters)"
            >
              重置
            </a-button>
          </a-space>
        </div>
      </template>

      <!-- 自定义单元格渲染（用于状态 Switch） -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <a-switch
            :checked="record.status === 'active'"
            @change="(checked) => handleStatusChange(record, checked)"
          >
            <template #checkedChildren>{{ $t('user.active') }}</template>
            <template #unCheckedChildren>{{ $t('user.inactive') }}</template>
          </a-switch>
        </template>
      </template>
    </ProTable>

    <!-- Create/Edit Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="editingId ? $t('exampleTable.editUser') : $t('exampleTable.createUser')"
      width="600px"
      @ok="handleSubmit"
    >
      <ProForm
        ref="formRef"
        :form-items="formItems"
        :initial-values="formData"
        :grid="{ cols: 2, gutter: 16 }"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@antdv-next/icons'
import { message } from 'antdv-next'
import { $t } from '@/locales'
import ProTable from '@/components/Pro/ProTable/index.vue'
import ProForm from '@/components/Pro/ProForm/index.vue'
import { getUserList, createUser, updateUser, deleteUser } from '@/api/user'
import { commonRules } from '@/utils/formRules'
import type { ProTableColumn } from '@/types/pro'
import type { ProFormItem } from '@/types/pro'

const modalVisible = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref()
const formData = ref({})
const searchInput = ref()

// Table columns configuration
const columns = computed<ProTableColumn[]>(() => [
  {
    title: $t('user.username'),
    dataIndex: 'username',
    width: 150,
    fixed: 'left',
    filterDropdown: () => null, // 使用自定义筛选下拉框
    onFilter: (value: any, record: any) => {
      return record.username.toLowerCase().includes(String(value).toLowerCase())
    }
  },
  {
    title: $t('user.email'),
    dataIndex: 'email',
    search: true,
    searchType: 'input',
    copyable: true
  },
  {
    title: $t('user.realName'),
    dataIndex: 'realName',
    search: true,
    searchType: 'input'
  },
  {
    title: $t('user.phone'),
    dataIndex: 'phone'
  },
  {
    title: $t('user.gender'),
    dataIndex: 'gender',
    search: true,
    searchType: 'select',
    searchOptions: [
      { label: $t('user.male'), value: 'male' },
      { label: $t('user.female'), value: 'female' }
    ],
    valueType: 'tag',
    valueEnum: {
      male: { text: $t('user.male'), color: 'blue' },
      female: { text: $t('user.female'), color: 'pink' }
    }
  },
  {
    title: $t('common.status'),
    dataIndex: 'status',
    width: 150,
    filters: [
      { text: $t('user.active'), value: 'active' },
      { text: $t('user.inactive'), value: 'inactive' }
    ],
    onFilter: (value: any, record: any) => record.status === value
  },
  {
    title: $t('common.createTime'),
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    search: true,
    searchType: 'dateRange',
    sorter: true
  },
  {
    title: $t('common.actions'),
    dataIndex: 'action',
    width: 200,
    fixed: 'right',
    actions: [
      {
        label: $t('common.edit'),
        icon: EditOutlined,
        onClick: (record) => handleEdit(record)
      },
      {
        label: $t('common.delete'),
        icon: DeleteOutlined,
        danger: true,
        confirm: $t('user.confirmDelete'),
        onClick: (record) => handleDelete(record)
      }
    ]
  }
])

// Form items configuration
const formItems = computed<ProFormItem[]>(() => [
  {
    name: 'username',
    label: $t('user.username'),
    type: 'input',
    required: true,
    rules: [
      commonRules.required(),
      commonRules.length(3, 20),
      commonRules.username()
    ]
  },
  {
    name: 'email',
    label: $t('user.email'),
    type: 'input',
    required: true,
    rules: [
      commonRules.required(),
      commonRules.email()
    ]
  },
  {
    name: 'realName',
    label: $t('user.realName'),
    type: 'input',
    required: true
  },
  {
    name: 'phone',
    label: $t('user.phone'),
    type: 'input',
    rules: [commonRules.phone()]
  },
  {
    name: 'gender',
    label: $t('user.gender'),
    type: 'radio',
    required: true,
    options: [
      { label: $t('user.male'), value: 'male' },
      { label: $t('user.female'), value: 'female' }
    ]
  },
  {
    name: 'status',
    label: $t('common.status'),
    type: 'radio',
    required: true,
    initialValue: 'active',
    options: [
      { label: $t('user.active'), value: 'active' },
      { label: $t('user.inactive'), value: 'inactive' }
    ]
  },
  {
    name: 'bio',
    label: $t('user.bio'),
    type: 'textarea',
    colSpan: 2,
    props: {
      rows: 4,
      maxLength: 200,
      showCount: true
    }
  }
])

// Methods
const fetchData = async (params: any) => {
  const res = await getUserList(params)
  return {
    data: res.data.list,
    total: res.data.total,
    success: true
  }
}

const handleSearch = (selectedKeys: any[], confirm: any, dataIndex: string) => {
  confirm()
  nextTick(() => {
    searchInput.value?.blur()
  })
}

const handleReset = (clearFilters?: () => void) => {
  clearFilters?.()
}

const handleStatusChange = async (record: any, checked: boolean) => {
  try {
    const newStatus = checked ? 'active' : 'inactive'
    await updateUser(record.id, { ...record, status: newStatus })
    record.status = newStatus
    message.success($t('exampleTable.updateSuccess'))
  } catch (error: any) {
    message.error(error.message || $t('common.error'))
  }
}

const handleCreate = () => {
  editingId.value = null
  formData.value = {}
  modalVisible.value = true
}

const handleEdit = (record: any) => {
  editingId.value = record.id
  formData.value = { ...record }
  modalVisible.value = true
}

const handleDelete = async (record: any) => {
  await deleteUser(record.id)
  message.success($t('exampleTable.deleteSuccess'))
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  const values = formRef.value?.getFieldsValue()

  try {
    if (editingId.value) {
      await updateUser(editingId.value, values)
      message.success($t('exampleTable.updateSuccess'))
    } else {
      await createUser(values)
      message.success($t('exampleTable.createSuccess'))
    }
    modalVisible.value = false
  } catch (error: any) {
    message.error(error.message || $t('common.error'))
  }
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
