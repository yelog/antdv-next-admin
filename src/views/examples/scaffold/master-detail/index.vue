<template>
  <div class="page-container">
    <div class="card">
      <h2>{{ $t('examples.scaffold.masterDetail.title') }}</h2>
      <p class="text-secondary mb-lg">{{ $t('examples.scaffold.masterDetail.description') }}</p>

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
      :title="$t('examples.scaffold.masterDetail.drawerTitle')"
      :destroy-on-close="false"
    >
      <template v-if="activeRecord">
        <ProDetail
          :title="`#${activeRecord.id}`"
          :sub-title="$t('examples.scaffold.masterDetail.ticketNumber')"
          :tags="[{ text: getStatusText(activeRecord.status), color: getStatusColor(activeRecord.status) }]"
          :descriptions="detailColumns"
          :data="activeRecord"
          :description-column="1"
          :tabs="drawerTabs"
          v-model:active-tab="activeTab"
        >
          <template #tab-desc>
            <div class="tab-panel">
              {{ activeRecord.description }}
            </div>
          </template>
          <template #tab-logs>
            <a-timeline>
              <a-timeline-item v-for="log in activeRecord.logs" :key="log.time + log.action">
                <strong>{{ log.action }}</strong>
                <div class="text-secondary">{{ log.operator }} · {{ log.time }}</div>
              </a-timeline-item>
            </a-timeline>
          </template>
        </ProDetail>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { $t } from '@/locales'
import ProDetail from '@/components/Pro/ProDetail/index.vue'
import type { ProDescriptionItem, ProDetailTab } from '@/types/pro'

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

const statusTextMap: Record<TicketStatus, string> = computed(() => ({
  open: $t('examples.scaffold.masterDetail.statusOpen'),
  processing: $t('examples.scaffold.masterDetail.statusProcessing'),
  closed: $t('examples.scaffold.masterDetail.statusClosed')
})).value

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
      title: $t('examples.scaffold.masterDetail.ticketTitle', { index: i }),
      owner: i % 2 === 0 ? $t('examples.scaffold.masterDetail.ownerZhang') : $t('examples.scaffold.masterDetail.ownerLi'),
      priority: i % 5 === 0 ? 'P0' : i % 2 === 0 ? 'P1' : 'P2',
      status: i % 4 === 0 ? 'closed' : i % 3 === 0 ? 'processing' : 'open',
      createdAt: new Date(Date.now() - i * 3600 * 1000).toLocaleString(),
      description: $t('examples.scaffold.masterDetail.ticketDescription', { index: i }),
      logs: [
        {
          action: $t('examples.scaffold.masterDetail.actionCreate'),
          operator: $t('examples.scaffold.masterDetail.operatorSystem'),
          time: new Date(Date.now() - i * 3600 * 1000).toLocaleString()
        },
        {
          action: $t('examples.scaffold.masterDetail.actionAssign'),
          operator: $t('examples.scaffold.masterDetail.operatorDispatch'),
          time: new Date(Date.now() - i * 1800 * 1000).toLocaleString()
        }
      ]
    }
  })
)

const columns = computed(() => [
  { title: $t('examples.scaffold.masterDetail.colTicketNumber'), dataIndex: 'id', width: 120 },
  { title: $t('examples.scaffold.masterDetail.colTitle'), dataIndex: 'title', ellipsis: true },
  { title: $t('examples.scaffold.masterDetail.colOwner'), dataIndex: 'owner', width: 120 },
  { title: $t('examples.scaffold.masterDetail.colPriority'), dataIndex: 'priority', width: 100 },
  { title: $t('examples.scaffold.masterDetail.colStatus'), dataIndex: 'status', width: 120 },
  { title: $t('examples.scaffold.masterDetail.colCreatedAt'), dataIndex: 'createdAt', width: 190 }
])

const detailColumns = computed<ProDescriptionItem[]>(() => [
  { label: $t('examples.scaffold.masterDetail.titleLabel'), dataIndex: 'title' },
  { label: $t('examples.scaffold.masterDetail.ownerLabel'), dataIndex: 'owner' },
  { label: $t('examples.scaffold.masterDetail.priorityLabel'), dataIndex: 'priority' },
  { label: $t('examples.scaffold.masterDetail.createdAtLabel'), dataIndex: 'createdAt' }
])

const drawerTabs = computed<ProDetailTab[]>(() => [
  { key: 'desc', label: $t('examples.scaffold.masterDetail.descTab') },
  { key: 'logs', label: $t('examples.scaffold.masterDetail.logsTab') }
])

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

.tab-panel {
  line-height: 1.8;
  color: var(--color-text-secondary);
}
</style>
