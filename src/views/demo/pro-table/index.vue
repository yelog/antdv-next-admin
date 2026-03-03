<script setup lang="ts">
import type { ProTableColumn } from '@/types/pro'
import { PlusOutlined } from '@antdv-next/icons'
import { onMounted, ref } from 'vue'
import ProTable from '@/components/Pro/ProTable/index.vue'

const loading = ref(false)
const dataSource = ref([])

const columns: ProTableColumn[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    search: true,
    valueType: 'text',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    search: true,
    valueType: 'text',
  },
  {
    title: '状态',
    dataIndex: 'status',
    search: true,
    valueType: 'tag',
    options: [
      { label: '启用', value: 'active', color: 'green' },
      { label: '禁用', value: 'inactive', color: 'red' },
    ],
  },
  {
    title: '角色',
    dataIndex: 'role',
    valueType: 'text',
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
  },
  {
    title: '操作',
    dataIndex: 'action',
    actions: [
      { label: '编辑', onClick: record => console.log('编辑', record) },
      { label: '删除', danger: true, confirm: '确认删除？', onClick: record => console.log('删除', record) },
    ],
  },
]

const searchConfig = {
  defaultCollapsed: false,
  labelWidth: 80,
}

// Mock data
onMounted(() => {
  loading.value = true
  setTimeout(() => {
    dataSource.value = [
      { id: 1, name: '张三', email: 'zhangsan@example.com', status: 'active', role: '管理员', createdAt: '2024-01-15 10:30:00' },
      { id: 2, name: '李四', email: 'lisi@example.com', status: 'inactive', role: '用户', createdAt: '2024-01-14 14:20:00' },
      { id: 3, name: '王五', email: 'wangwu@example.com', status: 'active', role: '编辑', createdAt: '2024-01-13 09:15:00' },
      { id: 4, name: '赵六', email: 'zhaoliu@example.com', status: 'active', role: '用户', createdAt: '2024-01-12 16:45:00' },
      { id: 5, name: '钱七', email: 'qianqi@example.com', status: 'inactive', role: '用户', createdAt: '2024-01-11 11:30:00' },
    ]
    loading.value = false
  }, 500)
})
</script>

<template>
  <div class="demo-container">
    <ProTable
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :search="searchConfig"
      row-key="id"
    >
      <template #toolbar>
        <a-button type="primary">
          <PlusOutlined /> 新增
        </a-button>
      </template>
    </ProTable>
  </div>
</template>

<style scoped>
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
