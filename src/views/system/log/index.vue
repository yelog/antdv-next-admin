<template>
  <div class="page-container">
    <div class="log-container">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="operation" tab="操作日志">
          <ProTable
            ref="operationTableRef"
            :key="'operation-' + operationRefreshKey"
            :columns="operationColumns"
            :request="loadOperationLogs"
            :toolbar="{ title: '操作日志' }"
          >
            <template #toolbar-actions>
              <a-button danger @click="handleClearOperationLog">
                <DeleteOutlined /> 清空日志
              </a-button>
            </template>
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-tag :color="actionColorMap[record.action] || 'default'">
                  {{ actionLabelMap[record.action] || record.action }}
                </a-tag>
              </template>
              <template v-if="column.key === 'status'">
                <span class="status-tag" :class="record.status === 'success' ? 'status-success' : 'status-fail'">
                  <span class="status-dot" />
                  {{ record.status === 'success' ? '成功' : '失败' }}
                </span>
              </template>
              <template v-if="column.key === 'duration'">
                <span :style="{ color: record.duration > 300 ? '#ff4d4f' : record.duration > 100 ? '#faad14' : '#52c41a' }">
                  {{ record.duration }}ms
                </span>
              </template>
            </template>
          </ProTable>
        </a-tab-pane>

        <a-tab-pane key="login" tab="登录日志">
          <ProTable
            ref="loginTableRef"
            :key="'login-' + loginRefreshKey"
            :columns="loginColumns"
            :request="loadLoginLogs"
            :toolbar="{ title: '登录日志' }"
          >
            <template #toolbar-actions>
              <a-button danger @click="handleClearLoginLog">
                <DeleteOutlined /> 清空日志
              </a-button>
            </template>
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <span class="status-tag" :class="record.status === 'success' ? 'status-success' : 'status-fail'">
                  <span class="status-dot" />
                  {{ record.status === 'success' ? '成功' : '失败' }}
                </span>
              </template>
            </template>
          </ProTable>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message, Modal } from 'antdv-next'
import { DeleteOutlined } from '@antdv-next/icons'
import ProTable from '@/components/Pro/ProTable/index.vue'
import type { ProTableColumn } from '@/types/pro'
import { getOperationLogList, getLoginLogList, clearOperationLog, clearLoginLog } from '@/api/log'

const activeTab = ref('operation')
const operationRefreshKey = ref(0)
const loginRefreshKey = ref(0)

const actionLabelMap: Record<string, string> = {
  login: '登录',
  logout: '登出',
  create: '新增',
  update: '修改',
  delete: '删除',
  export: '导出',
  import: '导入',
  other: '其他'
}

const actionColorMap: Record<string, string> = {
  login: 'blue',
  logout: 'default',
  create: 'green',
  update: 'orange',
  delete: 'red',
  export: 'purple',
  import: 'cyan',
  other: 'default'
}

// 操作日志列
const operationColumns: ProTableColumn[] = [
  {
    title: '操作用户',
    dataIndex: 'username',
    key: 'username',
    width: 100,
    search: true,
    searchType: 'input'
  },
  {
    title: '操作模块',
    dataIndex: 'module',
    key: 'module',
    width: 110,
    search: true,
    searchType: 'select',
    searchOptions: [
      { label: '用户管理', value: '用户管理' },
      { label: '角色管理', value: '角色管理' },
      { label: '菜单管理', value: '菜单管理' },
      { label: '数据字典', value: '数据字典' },
      { label: '系统登录', value: '系统登录' },
      { label: '个人中心', value: '个人中心' },
      { label: '数据看板', value: '数据看板' }
    ]
  },
  {
    title: '操作类型',
    dataIndex: 'action',
    key: 'action',
    width: 90,
    search: true,
    searchType: 'select',
    searchOptions: [
      { label: '登录', value: 'login' },
      { label: '登出', value: 'logout' },
      { label: '新增', value: 'create' },
      { label: '修改', value: 'update' },
      { label: '删除', value: 'delete' },
      { label: '导出', value: 'export' }
    ]
  },
  {
    title: '操作描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  {
    title: '请求方法',
    dataIndex: 'method',
    key: 'method',
    width: 90
  },
  {
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip',
    width: 130
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    search: true,
    searchType: 'select',
    searchOptions: [
      { label: '成功', value: 'success' },
      { label: '失败', value: 'fail' }
    ]
  },
  {
    title: '耗时',
    dataIndex: 'duration',
    key: 'duration',
    width: 80
  },
  {
    title: '操作时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 170
  }
]

// 登录日志列
const loginColumns: ProTableColumn[] = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    width: 120,
    search: true,
    searchType: 'input'
  },
  {
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip',
    width: 140,
    search: true,
    searchType: 'input'
  },
  {
    title: '浏览器',
    dataIndex: 'browser',
    key: 'browser',
    width: 130
  },
  {
    title: '操作系统',
    dataIndex: 'os',
    key: 'os',
    width: 130
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    search: true,
    searchType: 'select',
    searchOptions: [
      { label: '成功', value: 'success' },
      { label: '失败', value: 'fail' }
    ]
  },
  {
    title: '提示信息',
    dataIndex: 'message',
    key: 'message',
    ellipsis: true
  },
  {
    title: '登录时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 170
  }
]

const handleTabChange = () => {}

const loadOperationLogs = async (params: any) => {
  try {
    const response = await getOperationLogList({
      username: params.username,
      module: params.module,
      action: params.action,
      status: params.status,
      page: params.current,
      pageSize: params.pageSize
    }) as any
    if (response.code === 200) {
      return { data: response.data.list, total: response.data.total, success: true }
    }
  } catch (error) {
    console.error('加载操作日志失败:', error)
  }
  return { data: [], total: 0, success: false }
}

const loadLoginLogs = async (params: any) => {
  try {
    const response = await getLoginLogList({
      username: params.username,
      ip: params.ip,
      status: params.status,
      page: params.current,
      pageSize: params.pageSize
    }) as any
    if (response.code === 200) {
      return { data: response.data.list, total: response.data.total, success: true }
    }
  } catch (error) {
    console.error('加载登录日志失败:', error)
  }
  return { data: [], total: 0, success: false }
}

const handleClearOperationLog = () => {
  Modal.confirm({
    title: '确认清空',
    content: '确定要清空所有操作日志吗？此操作不可恢复。',
    okType: 'danger',
    onOk: async () => {
      try {
        const response = await clearOperationLog() as any
        if (response.code === 200) {
          message.success('清空成功')
          operationRefreshKey.value++
        }
      } catch (error) {
        message.error('清空失败')
      }
    }
  })
}

const handleClearLoginLog = () => {
  Modal.confirm({
    title: '确认清空',
    content: '确定要清空所有登录日志吗？此操作不可恢复。',
    okType: 'danger',
    onOk: async () => {
      try {
        const response = await clearLoginLog() as any
        if (response.code === 200) {
          message.success('清空成功')
          loginRefreshKey.value++
        }
      } catch (error) {
        message.error('清空失败')
      }
    }
  })
}
</script>

<style scoped lang="scss">
.log-container {
  background: var(--color-bg-container);
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  :deep(.ant-tabs-nav) {
    margin-bottom: 8px;
  }

  :deep(.ant-table-thead > tr > th),
  :deep(.ant-table-thead > tr > td) {
    background: #fafafa;
  }
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 20px;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &.status-success {
    background: #f6ffed;
    color: #389e0d;
    .status-dot { background: #52c41a; }
  }

  &.status-fail {
    background: #fff2f0;
    color: #cf1322;
    .status-dot { background: #ff4d4f; }
  }
}
</style>
