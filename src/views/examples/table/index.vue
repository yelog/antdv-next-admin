<template>
  <div class="page-container">
    <ProTable
      :columns="columns"
      :request="fetchData"
      :toolbar="{
        title: '用户列表',
        subTitle: 'ProTable 示例',
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
          <PlusOutlined /> 新建用户
        </a-button>
      </template>
    </ProTable>

    <!-- Create/Edit Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="editingId ? '编辑用户' : '新建用户'"
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
import { ref } from 'vue'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@antdv-next/icons'
import { message } from 'antdv-next'
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

// Table columns configuration
const columns: ProTableColumn[] = [
  {
    title: '用户名',
    dataIndex: 'username',
    search: true,
    searchType: 'input',
    width: 150,
    fixed: 'left'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    search: true,
    searchType: 'input',
    copyable: true
  },
  {
    title: '真实姓名',
    dataIndex: 'realName',
    search: true,
    searchType: 'input'
  },
  {
    title: '手机号',
    dataIndex: 'phone'
  },
  {
    title: '性别',
    dataIndex: 'gender',
    search: true,
    searchType: 'select',
    searchOptions: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ],
    valueType: 'tag',
    valueEnum: {
      male: { text: '男', color: 'blue' },
      female: { text: '女', color: 'pink' }
    }
  },
  {
    title: '状态',
    dataIndex: 'status',
    search: true,
    searchType: 'select',
    searchOptions: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' }
    ],
    valueType: 'badge',
    valueEnum: {
      active: { text: '启用', status: 'success' },
      inactive: { text: '禁用', status: 'error' }
    }
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    search: true,
    searchType: 'dateRange',
    sorter: true
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 200,
    fixed: 'right',
    actions: [
      {
        label: '编辑',
        icon: EditOutlined,
        onClick: (record) => handleEdit(record)
      },
      {
        label: '删除',
        icon: DeleteOutlined,
        danger: true,
        confirm: '确定要删除该用户吗？',
        onClick: (record) => handleDelete(record)
      }
    ]
  }
]

// Form items configuration
const formItems: ProFormItem[] = [
  {
    name: 'username',
    label: '用户名',
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
    label: '邮箱',
    type: 'input',
    required: true,
    rules: [
      commonRules.required(),
      commonRules.email()
    ]
  },
  {
    name: 'realName',
    label: '真实姓名',
    type: 'input',
    required: true
  },
  {
    name: 'phone',
    label: '手机号',
    type: 'input',
    rules: [commonRules.phone()]
  },
  {
    name: 'gender',
    label: '性别',
    type: 'radio',
    required: true,
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ]
  },
  {
    name: 'status',
    label: '状态',
    type: 'radio',
    required: true,
    initialValue: 'active',
    options: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' }
    ]
  },
  {
    name: 'bio',
    label: '个人简介',
    type: 'textarea',
    colSpan: 2,
    props: {
      rows: 4,
      maxLength: 200,
      showCount: true
    }
  }
]

// Methods
const fetchData = async (params: any) => {
  const res = await getUserList(params)
  return {
    data: res.data.list,
    total: res.data.total,
    success: true
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
  message.success('删除成功')
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  const values = formRef.value?.getFieldsValue()

  try {
    if (editingId.value) {
      await updateUser(editingId.value, values)
      message.success('更新成功')
    } else {
      await createUser(values)
      message.success('创建成功')
    }
    modalVisible.value = false
  } catch (error: any) {
    message.error(error.message || '操作失败')
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
