<template>
  <div class="page-container">
    <div class="log-container">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="operation" :tab="t('log.operationLog')">
          <ProTable
            ref="operationTableRef"
            :key="'operation-' + operationRefreshKey"
            :columns="operationColumns"
            :request="loadOperationLogs"
            :toolbar="{ title: t('log.operationLog') }"
          >
            <template #toolbar-actions>
              <a-button danger @click="handleClearOperationLog">
                <DeleteOutlined /> {{ t('log.clearLog') }}
              </a-button>
            </template>
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-tag :color="actionColorMap[record.action] || 'default'">
                  {{ t(`log.actionTypes.${record.action}`) || record.action }}
                </a-tag>
              </template>
              <template v-if="column.key === 'status'">
                <span class="status-tag" :class="record.status === 'success' ? 'status-success' : 'status-fail'">
                  <span class="status-dot" />
                  {{ record.status === 'success' ? t('log.success') : t('log.fail') }}
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

        <a-tab-pane key="login" :tab="t('log.loginLog')">
          <ProTable
            ref="loginTableRef"
            :key="'login-' + loginRefreshKey"
            :columns="loginColumns"
            :request="loadLoginLogs"
            :toolbar="{ title: t('log.loginLog') }"
          >
            <template #toolbar-actions>
              <a-button danger @click="handleClearLoginLog">
                <DeleteOutlined /> {{ t('log.clearLog') }}
              </a-button>
            </template>
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <span class="status-tag" :class="record.status === 'success' ? 'status-success' : 'status-fail'">
                  <span class="status-dot" />
                  {{ record.status === 'success' ? t('log.success') : t('log.fail') }}
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
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { message, Modal } from 'antdv-next'
import { DeleteOutlined } from '@antdv-next/icons'
import ProTable from '@/components/Pro/ProTable/index.vue'
import type { ProTableColumn } from '@/types/pro'
import { getOperationLogList, getLoginLogList, clearOperationLog, clearLoginLog } from '@/api/log'

const { t } = useI18n()

const activeTab = ref('operation')
const operationRefreshKey = ref(0)
const loginRefreshKey = ref(0)

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

// operation log columns
const operationColumns = computed<ProTableColumn[]>(() => [
  {
    title: t('log.operationUser'),
    dataIndex: 'username',
    key: 'username',
    width: 100,
    search: true,
    searchType: 'input'
  },
  {
    title: t('log.operationModule'),
    dataIndex: 'module',
    key: 'module',
    width: 110,
    search: true,
    searchType: 'select',
    searchOptions: [
      { label: t('log.modules.userManagement'), value: 'userManagement' },
      { label: t('log.modules.roleManagement'), value: 'roleManagement' },
      { label: t('log.modules.menuManagement'), value: 'menuManagement' },
      { label: t('log.modules.dictionary'), value: 'dictionary' },
      { label: t('log.modules.systemLogin'), value: 'systemLogin' },
      { label: t('log.modules.profile'), value: 'profile' },
      { label: t('log.modules.dashboard'), value: 'dashboard' }
    ]
  },
  {
    title: t('log.operationType'),
    dataIndex: 'action',
    key: 'action',
    width: 90,
    search: true,
    searchType: 'select',
    searchOptions: [
      { label: t('log.actionTypes.login'), value: 'login' },
      { label: t('log.actionTypes.logout'), value: 'logout' },
      { label: t('log.actionTypes.create'), value: 'create' },
      { label: t('log.actionTypes.update'), value: 'update' },
      { label: t('log.actionTypes.delete'), value: 'delete' },
      { label: t('log.actionTypes.export'), value: 'export' }
    ]
  },
  {
    title: t('log.operationDescription'),
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  {
    title: t('log.requestMethod'),
    dataIndex: 'method',
    key: 'method',
    width: 90
  },
  {
    title: t('log.ipAddress'),
    dataIndex: 'ip',
    key: 'ip',
    width: 130
  },
  {
    title: t('common.status'),
    dataIndex: 'status',
    key: 'status',
    width: 80,
    search: true,
    searchType: 'select',
    searchOptions: [
      { label: t('log.success'), value: 'success' },
      { label: t('log.fail'), value: 'fail' }
    ]
  },
  {
    title: t('log.duration'),
    dataIndex: 'duration',
    key: 'duration',
    width: 80
  },
  {
    title: t('log.operationTime'),
    dataIndex: 'createTime',
    key: 'createTime',
    width: 170
  }
])

// login log columns
const loginColumns = computed<ProTableColumn[]>(() => [
  {
    title: t('log.username'),
    dataIndex: 'username',
    key: 'username',
    width: 120,
    search: true,
    searchType: 'input'
  },
  {
    title: t('log.ipAddress'),
    dataIndex: 'ip',
    key: 'ip',
    width: 140,
    search: true,
    searchType: 'input'
  },
  {
    title: t('log.browser'),
    dataIndex: 'browser',
    key: 'browser',
    width: 130
  },
  {
    title: t('log.os'),
    dataIndex: 'os',
    key: 'os',
    width: 130
  },
  {
    title: t('common.status'),
    dataIndex: 'status',
    key: 'status',
    width: 80,
    search: true,
    searchType: 'select',
    searchOptions: [
      { label: t('log.success'), value: 'success' },
      { label: t('log.fail'), value: 'fail' }
    ]
  },
  {
    title: t('log.message'),
    dataIndex: 'message',
    key: 'message',
    ellipsis: true
  },
  {
    title: t('log.loginTime'),
    dataIndex: 'createTime',
    key: 'createTime',
    width: 170
  }
])

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
    console.error(t('log.loadOperationLogFailed'), error)
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
    console.error(t('log.loadLoginLogFailed'), error)
  }
  return { data: [], total: 0, success: false }
}

const handleClearOperationLog = () => {
  Modal.confirm({
    title: t('log.confirmClear'),
    content: t('log.confirmClearOperation'),
    okType: 'danger',
    onOk: async () => {
      try {
        const response = await clearOperationLog() as any
        if (response.code === 200) {
          message.success(t('log.clearSuccess'))
          operationRefreshKey.value++
        }
      } catch (error) {
        message.error(t('log.clearFailed'))
      }
    }
  })
}

const handleClearLoginLog = () => {
  Modal.confirm({
    title: t('log.confirmClear'),
    content: t('log.confirmClearLogin'),
    okType: 'danger',
    onOk: async () => {
      try {
        const response = await clearLoginLog() as any
        if (response.code === 200) {
          message.success(t('log.clearSuccess'))
          loginRefreshKey.value++
        }
      } catch (error) {
        message.error(t('log.clearFailed'))
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
