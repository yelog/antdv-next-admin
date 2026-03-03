<script setup lang="ts">
import type { ActivityItem } from '@/api/dashboard'
import {
  ClockCircleOutlined,
  DollarOutlined,
  ReloadOutlined,
  RiseOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@antdv-next/icons'
import { message } from 'antdv-next'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {

  getDashboardStats,
  getRecentActivities,
  getSalesTrend,
  getUserDistribution,
} from '@/api/dashboard'
import ProChart from '@/components/Pro/ProChart/index.vue'
import ProStatCard from '@/components/Pro/ProStatCard/index.vue'
import i18n, { $t } from '@/locales'
import { useAuthStore } from '@/stores/auth'

// Initialize dayjs plugin
dayjs.extend(relativeTime)

const authStore = useAuthStore()

const now = ref(new Date())
let timer: number | null = null
const loading = ref(false)

// Data from API
const stats = ref({
  totalUsers: 0,
  totalOrders: 0,
  totalRevenue: 0,
  conversionRate: 0,
})
const salesTrend = ref<Array<{ month: string, sales: number }>>([])
const userDistribution = ref<Array<{ city: string, value: number }>>([])
const activities = ref<ActivityItem[]>([])

const displayName = computed(() => {
  return authStore.user?.realName || authStore.user?.username || 'Administrator'
})

const greetingText = computed(() => {
  const hour = now.value.getHours()
  if (hour < 6) {
    return $t('dashboard.goodNight')
  }
  if (hour < 12) {
    return $t('dashboard.goodMorning')
  }
  if (hour < 18) {
    return $t('dashboard.goodAfternoon')
  }
  return $t('dashboard.goodEvening')
})

const currentTimeText = computed(() => {
  const targetLocale = String(i18n.global.locale.value || 'en-US')

  try {
    return new Intl.DateTimeFormat(targetLocale, {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(now.value)
  }
  catch {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(now.value)
  }
})

const statCards = computed(() => [
  {
    key: 'users',
    tone: 'blue' as const,
    label: $t('dashboard.totalUsers'),
    value: stats.value.totalUsers.toLocaleString(),
    trend: '+12.5%',
    icon: UserOutlined,
  },
  {
    key: 'orders',
    tone: 'green' as const,
    label: $t('dashboard.totalOrders'),
    value: stats.value.totalOrders.toLocaleString(),
    trend: '+8.2%',
    icon: ShoppingOutlined,
  },
  {
    key: 'revenue',
    tone: 'orange' as const,
    label: $t('dashboard.totalRevenue'),
    value: `¥${stats.value.totalRevenue.toLocaleString()}`,
    trend: '+15.3%',
    icon: DollarOutlined,
  },
  {
    key: 'conversion',
    tone: 'purple' as const,
    label: $t('dashboard.conversionRate'),
    value: `${stats.value.conversionRate}%`,
    trend: '+0.8%',
    icon: RiseOutlined,
  },
])

const salesChartData = computed(() => {
  return salesTrend.value.map(item => ({
    name: item.month,
    value: item.sales,
  }))
})

const userDistributionChartData = computed(() => {
  return userDistribution.value.map(item => ({
    name: item.city,
    value: item.value,
  }))
})

// Helper functions
function formatTime(timestamp: string) {
  return dayjs(timestamp).fromNow()
}

function getTagColor(type: string) {
  const colorMap: Record<string, string> = {
    success: 'green',
    info: 'blue',
    warning: 'orange',
    error: 'red',
  }
  return colorMap[type] || 'default'
}

function getTagText(type: string) {
  const textMap: Record<string, string> = {
    success: $t('dashboard.activityTags.success'),
    info: $t('dashboard.activityTags.info'),
    warning: $t('dashboard.activityTags.warning'),
    error: $t('dashboard.activityTags.error'),
  }
  return textMap[type] || type
}

// Fetch dashboard data
async function fetchDashboardData() {
  loading.value = true
  try {
    const [statsRes, salesRes, userRes, activitiesRes] = await Promise.all([
      getDashboardStats(),
      getSalesTrend(),
      getUserDistribution(),
      getRecentActivities(),
    ])

    stats.value = statsRes
    salesTrend.value = salesRes
    userDistribution.value = userRes
    activities.value = activitiesRes
  }
  catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    message.error($t('dashboard.fetchError'))
  }
  finally {
    loading.value = false
  }
}

// Refresh data
function refreshData() {
  fetchDashboardData()
  message.success($t('dashboard.refreshSuccess'))
}

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 60000)

  // Fetch initial data
  fetchDashboardData()
})

onBeforeUnmount(() => {
  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
})
</script>

<template>
  <div class="dashboard-container">
    <section class="card welcome-panel">
      <div class="welcome-main">
        <a-avatar :size="64" class="welcome-avatar">
          <template #icon>
            <UserOutlined />
          </template>
        </a-avatar>

        <div class="welcome-content">
          <p class="welcome-time">
            <ClockCircleOutlined />
            <span>{{ currentTimeText }}</span>
          </p>
          <h1 class="welcome-title">
            {{ greetingText }}，{{ displayName }}
          </h1>
          <p class="welcome-subtitle">
            {{ $t('dashboard.subtitle') }}
          </p>

          <div class="welcome-metas">
            <span class="meta-chip meta-chip-primary">{{ $t('dashboard.systemStable') }}</span>
            <span class="meta-chip">{{ $t('dashboard.todayFocus') }} · {{ $t('dashboard.totalRevenue') }}</span>
          </div>
        </div>
      </div>

      <div class="welcome-visual" aria-hidden="true">
        <div class="orb orb-a" />
        <div class="orb orb-b" />
        <div class="orb orb-c" />
        <div class="wave" />
      </div>
    </section>

    <section class="stats-grid">
      <ProStatCard
        v-for="card in statCards"
        :key="card.key"
        :label="card.label"
        :value="card.value"
        :trend="$t('dashboard.compareYesterday', { value: card.trend })"
        :icon="card.icon"
        :tone="card.tone"
        :loading="loading"
      />
    </section>

    <section class="charts-grid">
      <div class="card chart-card">
        <ProChart
          type="bar"
          :title="$t('dashboard.salesTrend')"
          :data="salesChartData"
          :height="280"
        >
          <template #extra>
            <a-button type="link" size="small" @click="refreshData">
              <ReloadOutlined />
              {{ $t('common.refresh') }}
            </a-button>
          </template>
        </ProChart>
      </div>

      <div class="card chart-card">
        <ProChart
          type="donut"
          :title="$t('dashboard.userDistribution')"
          :data="userDistributionChartData"
          :height="280"
          :loading="loading"
        />
      </div>
    </section>

    <section class="card activities-card">
      <div class="card-header">
        <h3 class="card-title">
          {{ $t('dashboard.recentActivities') }}
        </h3>
        <a-button type="link" size="small" @click="refreshData">
          <ReloadOutlined />
          {{ $t('common.refresh') }}
        </a-button>
      </div>

      <a-spin :spinning="loading">
        <ul class="activity-list">
          <li v-for="item in activities" :key="item.id" class="activity-item">
            <a-avatar :src="item.avatar" :size="40" />
            <div class="activity-content">
              <p class="activity-title">
                {{ item.action }}
              </p>
              <p class="activity-time">
                {{ formatTime(item.timestamp) }}
              </p>
            </div>
            <a-tag :color="getTagColor(item.type)">
              {{ getTagText(item.type) }}
            </a-tag>
          </li>
        </ul>
      </a-spin>
    </section>
  </div>
</template>

<style scoped lang="scss">
.dashboard-container {
  display: grid;
  gap: var(--spacing-lg);

  .welcome-panel {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30px 32px;
    background: linear-gradient(140deg, var(--color-bg-container) 0%, var(--color-primary-1) 220%);

    .welcome-main {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 18px;
      max-width: 70%;
    }

    .welcome-avatar {
      background: linear-gradient(135deg, #2f80ff 0%, #145dff 100%);
      box-shadow: 0 10px 24px rgba(24, 119, 255, 0.24);
      flex-shrink: 0;
    }

    .welcome-content {
      .welcome-time {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--color-text-tertiary);
        margin-bottom: 6px;
      }

      .welcome-title {
        font-size: 32px;
        line-height: 1.2;
        margin: 0 0 6px;
        color: var(--color-text-primary);
      }

      .welcome-subtitle {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: 14px;
      }

      .welcome-metas {
        margin-top: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;

        .meta-chip {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          color: var(--color-text-secondary);
          background: var(--color-bg-layout);
          border: 1px solid var(--color-border-secondary);

          &.meta-chip-primary {
            color: var(--color-primary);
            background: var(--color-primary-1);
            border-color: var(--color-primary-2);
          }
        }
      }
    }

    .welcome-visual {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 38%;
      pointer-events: none;

      .orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(2px);
      }

      .orb-a {
        width: 180px;
        height: 180px;
        right: 56px;
        top: -48px;
        background: rgba(24, 119, 255, 0.24);
      }

      .orb-b {
        width: 120px;
        height: 120px;
        right: 12px;
        top: 84px;
        background: rgba(82, 196, 26, 0.16);
      }

      .orb-c {
        width: 88px;
        height: 88px;
        right: 160px;
        bottom: 22px;
        background: rgba(250, 140, 22, 0.16);
      }

      .wave {
        position: absolute;
        right: -70px;
        bottom: -120px;
        width: 380px;
        height: 260px;
        border-radius: 42% 58% 56% 44% / 44% 44% 56% 56%;
        background: radial-gradient(circle at 20% 30%, rgba(24, 119, 255, 0.16), rgba(24, 119, 255, 0.02));
      }
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--spacing-md);
  }

  .charts-grid {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: var(--spacing-md);

    .chart-card {
      min-height: 360px;
      display: flex;
      flex-direction: column;
    }
  }

  .activities-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .card-title {
        margin: 0;
        font-size: 18px;
        color: var(--color-text-primary);
      }
    }

    .activity-list {
      display: grid;
      gap: 6px;

      .activity-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 10px;
        transition: all var(--duration-base) var(--ease-out);

        &:hover {
          background: var(--color-bg-layout);
        }

        .activity-content {
          flex: 1;
          min-width: 0;

          .activity-title {
            margin: 0;
            font-size: 14px;
            color: var(--color-text-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .activity-time {
            margin: 2px 0 0;
            font-size: 12px;
            color: var(--color-text-tertiary);
          }
        }
      }
    }
  }
}

@container (max-width: 1200px) {
  .dashboard-container {
    .stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .charts-grid {
      grid-template-columns: 1fr;
    }
  }
}

@container (max-width: 768px) {
  .dashboard-container {
    .welcome-panel {
      padding: 22px 18px;

      .welcome-main {
        max-width: 100%;
      }

      .welcome-visual {
        display: none;
      }

      .welcome-content {
        .welcome-title {
          font-size: 26px;
        }
      }
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
