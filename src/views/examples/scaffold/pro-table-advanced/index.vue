<template>
  <div class="page-container">
    <ProTable
      :columns="columns"
      :request="requestTableData"
      :toolbar="toolbarConfig"
      :search="{ labelWidth: 80, defaultCollapsed: true, collapsedRows: 1 }"
      :row-selection="rowSelection"
      row-key="id"
    >
      <template #toolbar-actions>
        <a-space wrap>
          <a-tag color="processing">已选 {{ selectedRowKeys.length }} 项</a-tag>
          <a-button :disabled="selectedRowKeys.length === 0" @click="handleBatchSetStatus('inactive')">
            批量禁用
          </a-button>
          <a-button danger :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">
            批量删除
          </a-button>
          <a-button type="primary" @click="exportCsv">导出当前数据</a-button>
        </a-space>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <a-switch
            :checked="record.status === 'active'"
            checked-children="启用"
            un-checked-children="禁用"
            @change="handleStatusSwitchChange(record.id, $event as boolean)"
          />
        </template>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message, Modal } from 'antdv-next'
import { EditOutlined, DeleteOutlined } from '@antdv-next/icons'
import ProTable from '@/components/Pro/ProTable/index.vue'
import { $t } from '@/locales'
import type { ProTableColumn } from '@/types/pro'

interface DemoRow {
  id: string
  username: string
  realName: string
  email: string
  gender: 'male' | 'female'
  status: 'active' | 'inactive'
  createdAt: string
}

const createMockRows = (): DemoRow[] => {
  return Array.from({ length: 48 }, (_, index) => {
    const i = index + 1
    const isMale = i % 2 === 0

    return {
      id: `demo-${i}`,
      username: `user_${String(i).padStart(3, '0')}`,
      realName: isMale ? `张三${i}` : `李四${i}`,
      email: `user_${i}@example.com`,
      gender: isMale ? 'male' : 'female',
      status: i % 3 === 0 ? 'inactive' : 'active',
      createdAt: new Date(Date.now() - i * 86400000).toISOString()
    }
  })
}

const tableRows = ref<DemoRow[]>(createMockRows())
const selectedRowKeys = ref<string[]>([])

const toolbarConfig = computed(() => ({
  title: 'ProTable 高阶示例',
  subTitle: '服务端分页模拟 + 批量操作 + 行内编辑 + 导出',
  actions: ['refresh', 'density', 'columnSetting'] as Array<'refresh' | 'density' | 'columnSetting'>
}))

const columns = computed<ProTableColumn[]>(() => [
  {
    title: '用户名',
    dataIndex: 'username',
    search: true,
    searchType: 'input',
    width: 150
  },
  {
    title: '姓名',
    dataIndex: 'realName',
    search: true,
    searchType: 'input',
    width: 140
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    search: true,
    searchType: 'input',
    width: 220
  },
  {
    title: '性别',
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
    },
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 140,
    search: true,
    searchType: 'select',
    searchOptions: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' }
    ]
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    width: 190
  },
  {
    title: $t('common.actions'),
    dataIndex: 'action',
    width: 180,
    fixed: 'right',
    actions: [
      {
        label: $t('common.edit'),
        icon: EditOutlined,
        onClick: (record) => {
          message.info(`模拟编辑：${record.username}`)
        }
      },
      {
        label: $t('common.delete'),
        icon: DeleteOutlined,
        danger: true,
        confirm: '确认删除该行吗？',
        onClick: (record) => {
          tableRows.value = tableRows.value.filter(item => item.id !== record.id)
          selectedRowKeys.value = selectedRowKeys.value.filter(id => id !== record.id)
          message.success('删除成功')
        }
      }
    ]
  }
])

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: Array<string | number>) => {
    selectedRowKeys.value = keys.map(item => String(item))
  }
}))

const requestTableData = async (params: Record<string, any>) => {
  const current = Number(params.current || 1)
  const pageSize = Number(params.pageSize || 10)

  let filtered = [...tableRows.value]

  if (params.username) {
    const keyword = String(params.username).toLowerCase()
    filtered = filtered.filter(item => item.username.toLowerCase().includes(keyword))
  }

  if (params.realName) {
    const keyword = String(params.realName).toLowerCase()
    filtered = filtered.filter(item => item.realName.toLowerCase().includes(keyword))
  }

  if (params.email) {
    const keyword = String(params.email).toLowerCase()
    filtered = filtered.filter(item => item.email.toLowerCase().includes(keyword))
  }

  if (params.gender) {
    filtered = filtered.filter(item => item.gender === params.gender)
  }

  if (params.status) {
    filtered = filtered.filter(item => item.status === params.status)
  }

  const start = (current - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)

  return {
    success: true,
    data: list,
    total: filtered.length
  }
}

const handleStatusChange = (id: string, checked: boolean) => {
  const row = tableRows.value.find(item => item.id === id)
  if (!row) {
    return
  }

  row.status = checked ? 'active' : 'inactive'
  message.success(`已${checked ? '启用' : '禁用'} ${row.username}`)
}

const handleStatusSwitchChange = (id: string, checked: boolean) => {
  handleStatusChange(id, checked)
}

const handleBatchSetStatus = (status: DemoRow['status']) => {
  if (selectedRowKeys.value.length === 0) {
    return
  }

  const set = new Set(selectedRowKeys.value)
  tableRows.value = tableRows.value.map(item => {
    if (set.has(item.id)) {
      return {
        ...item,
        status
      }
    }
    return item
  })

  message.success(`已批量设置 ${selectedRowKeys.value.length} 项状态`)
}

const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    return
  }

  Modal.confirm({
    title: '批量删除确认',
    content: `确认删除已选的 ${selectedRowKeys.value.length} 条数据吗？`,
    onOk: () => {
      const set = new Set(selectedRowKeys.value)
      tableRows.value = tableRows.value.filter(item => !set.has(item.id))
      selectedRowKeys.value = []
      message.success('批量删除完成')
    }
  })
}

const exportCsv = () => {
  const headers = ['id', 'username', 'realName', 'email', 'gender', 'status', 'createdAt']
  const rows = tableRows.value.map(item => [
    item.id,
    item.username,
    item.realName,
    item.email,
    item.gender,
    item.status,
    item.createdAt
  ])

  const csv = [headers, ...rows]
    .map(line => line.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `pro-table-advanced-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)

  message.success('CSV 导出成功')
}
</script>
