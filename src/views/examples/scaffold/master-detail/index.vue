<template>
  <div class="page-container">
    <div class="card">
      <h2>列表-详情示例</h2>
      <p class="text-secondary mb-lg">模拟工单主从页：左侧列表选择，右侧 Drawer 展示详情与操作历史。</p>

      <a-table
        :columns="columns"
        :data-source="listData"
        row-key="id"
        :pagination="{ pageSize: 8 }"
        :custom-row="buildRowProps"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
          </template>
        </template>
      </a-table>
    </div>

    <a-drawer
      v-model:open="drawerOpen"
      width="560"
      title="工单详情"
      :destroy-on-close="false"
    >
      <template v-if="activeRecord">
        <div class="detail-head">
          <div>
            <div class="label">单号</div>
            <strong>#{{ activeRecord.id }}</strong>
          </div>
          <a-tag :color="getStatusColor(activeRecord.status)">{{ getStatusText(activeRecord.status) }}</a-tag>
        </div>

        <a-descriptions :column="1" size="small" bordered class="mb-md">
          <a-descriptions-item label="标题">{{ activeRecord.title }}</a-descriptions-item>
          <a-descriptions-item label="负责人">{{ activeRecord.owner }}</a-descriptions-item>
          <a-descriptions-item label="优先级">{{ activeRecord.priority }}</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ activeRecord.createdAt }}</a-descriptions-item>
        </a-descriptions>

        <a-tabs v-model:active-key="activeTab" size="small">
          <a-tab-pane key="desc" tab="描述">
            <div class="tab-panel">
              {{ activeRecord.description }}
            </div>
          </a-tab-pane>
          <a-tab-pane key="logs" tab="操作记录">
            <a-timeline>
              <a-timeline-item v-for="log in activeRecord.logs" :key="log.time + log.action">
                <strong>{{ log.action }}</strong>
                <div class="text-secondary">{{ log.operator }} · {{ log.time }}</div>
              </a-timeline-item>
            </a-timeline>
          </a-tab-pane>
        </a-tabs>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type TicketStatus = 'open' | 'processing' | 'closed'

interface TicketRecord {
  id: string
  title: string
  owner: string
  priority: 'P0' | 'P1' | 'P2'
  status: TicketStatus
  createdAt: string
  description: string
  logs: Array<{
    action: string
    operator: string
    time: string
  }>
}

const statusTextMap: Record<TicketStatus, string> = {
  open: '待处理',
  processing: '处理中',
  closed: '已关闭'
}

const statusColorMap: Record<TicketStatus, string> = {
  open: 'blue',
  processing: 'processing',
  closed: 'default'
}

const listData = ref<TicketRecord[]>(
  Array.from({ length: 18 }, (_, index) => {
    const i = index + 1

    return {
      id: `T${String(i).padStart(4, '0')}`,
      title: `订单风控告警 #${i}`,
      owner: i % 2 === 0 ? '张工' : '李工',
      priority: i % 5 === 0 ? 'P0' : i % 2 === 0 ? 'P1' : 'P2',
      status: i % 4 === 0 ? 'closed' : i % 3 === 0 ? 'processing' : 'open',
      createdAt: new Date(Date.now() - i * 3600 * 1000).toLocaleString(),
      description: `这是第 ${i} 条工单的详细描述，包含背景信息、影响范围和建议处理动作。`,
      logs: [
        {
          action: '创建工单',
          operator: '系统',
          time: new Date(Date.now() - i * 3600 * 1000).toLocaleString()
        },
        {
          action: '分配负责人',
          operator: '调度中心',
          time: new Date(Date.now() - i * 1800 * 1000).toLocaleString()
        }
      ]
    }
  })
)

const columns = [
  { title: '单号', dataIndex: 'id', width: 120 },
  { title: '标题', dataIndex: 'title', ellipsis: true },
  { title: '负责人', dataIndex: 'owner', width: 120 },
  { title: '优先级', dataIndex: 'priority', width: 100 },
  { title: '状态', dataIndex: 'status', width: 120 },
  { title: '创建时间', dataIndex: 'createdAt', width: 190 }
]

const drawerOpen = ref(false)
const activeTab = ref('desc')
const activeRecord = ref<TicketRecord | null>(null)

const buildRowProps = (record: TicketRecord) => {
  return {
    style: { cursor: 'pointer' },
    onClick: () => {
      activeRecord.value = record
      activeTab.value = 'desc'
      drawerOpen.value = true
    }
  }
}

const getStatusText = (status: unknown) => {
  const key = (status || 'open') as TicketStatus
  return statusTextMap[key] || statusTextMap.open
}

const getStatusColor = (status: unknown) => {
  const key = (status || 'open') as TicketStatus
  return statusColorMap[key] || statusColorMap.open
}
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}

.mb-md {
  margin-bottom: var(--spacing-md);
}

.detail-head {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .label {
    color: var(--color-text-secondary);
    font-size: 12px;
  }
}

.tab-panel {
  line-height: 1.8;
  color: var(--color-text-secondary);
}
</style>
