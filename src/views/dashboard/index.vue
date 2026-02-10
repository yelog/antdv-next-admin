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
          <h1 class="welcome-title">{{ greetingText }}，{{ displayName }}</h1>
          <p class="welcome-subtitle">{{ $t('dashboard.subtitle') }}</p>

          <div class="welcome-metas">
            <span class="meta-chip meta-chip-primary">{{ $t('dashboard.systemStable') }}</span>
            <span class="meta-chip">{{ $t('dashboard.todayFocus') }} · {{ $t('dashboard.totalRevenue') }}</span>
          </div>
        </div>
      </div>

      <div class="welcome-visual" aria-hidden="true">
        <div class="orb orb-a"></div>
        <div class="orb orb-b"></div>
        <div class="orb orb-c"></div>
        <div class="wave"></div>
      </div>
    </section>

    <section class="stats-grid">
      <article
        v-for="card in statCards"
        :key="card.key"
        class="stat-card"
        :class="`tone-${card.tone}`"
      >
        <p class="stat-label">{{ card.label }}</p>
        <p class="stat-value">{{ card.value }}</p>
        <p class="stat-trend">
          <RiseOutlined />
          <span>{{ $t('dashboard.compareYesterday', { value: card.trend }) }}</span>
        </p>

        <component :is="card.icon" class="stat-watermark" />
      </article>
    </section>

    <section class="charts-grid">
      <div class="card chart-card">
        <div class="card-header">
          <h3 class="card-title">{{ $t('dashboard.salesTrend') }}</h3>
          <a-button type="link" size="small">{{ $t('dashboard.viewMore') }}</a-button>
        </div>

        <div class="chart-canvas line-canvas">
          <div class="line-grid"></div>
          <div class="line-fill"></div>
          <div class="bars">
            <span
              v-for="(value, index) in salesBars"
              :key="index"
              :style="{ height: `${value}%` }"
            ></span>
          </div>
        </div>
      </div>

      <div class="card chart-card">
        <div class="card-header">
          <h3 class="card-title">{{ $t('dashboard.userDistribution') }}</h3>
        </div>

        <div class="chart-canvas donut-canvas">
          <div class="donut-ring"></div>
          <ul class="legend-list">
            <li v-for="item in userDistribution" :key="item.label">
              <span class="legend-dot" :style="{ background: item.color }"></span>
              <span class="legend-label">{{ item.label }}</span>
              <span class="legend-value">{{ item.value }}%</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="card activities-card">
      <div class="card-header">
        <h3 class="card-title">{{ $t('dashboard.recentActivities') }}</h3>
        <a-button type="link" size="small">{{ $t('dashboard.viewMore') }}</a-button>
      </div>

      <ul class="activity-list">
        <li v-for="item in activities" :key="item.id" class="activity-item">
          <a-avatar :src="item.avatar" :size="40" />
          <div class="activity-content">
            <p class="activity-title">{{ item.action }}</p>
            <p class="activity-time">{{ item.time }}</p>
          </div>
          <a-tag :color="item.tagColor">{{ item.tag }}</a-tag>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RiseOutlined,
  ClockCircleOutlined
} from '@antdv-next/icons'
import { useAuthStore } from '@/stores/auth'
import i18n, { $t } from '@/locales'

const authStore = useAuthStore()

const now = ref(new Date())
let timer: number | null = null

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
  const targetLocale = i18n.global.locale.value === 'zh-CN' ? 'zh-CN' : 'en-US'
  return new Intl.DateTimeFormat(targetLocale, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(now.value)
})

const statCards = computed(() => [
  {
    key: 'users',
    tone: 'blue',
    label: $t('dashboard.totalUsers'),
    value: '12,458',
    trend: '+12.5%',
    icon: UserOutlined
  },
  {
    key: 'orders',
    tone: 'green',
    label: $t('dashboard.totalOrders'),
    value: '8,946',
    trend: '+8.2%',
    icon: ShoppingOutlined
  },
  {
    key: 'revenue',
    tone: 'orange',
    label: $t('dashboard.totalRevenue'),
    value: '¥456,789',
    trend: '+15.3%',
    icon: DollarOutlined
  },
  {
    key: 'conversion',
    tone: 'purple',
    label: $t('dashboard.conversionRate'),
    value: '3.24%',
    trend: '+0.8%',
    icon: RiseOutlined
  }
])

const salesBars = [34, 48, 44, 62, 58, 70, 66, 72]

const userDistribution = computed(() => [
  { label: $t('dashboard.newUsers'), value: 46, color: '#1677ff' },
  { label: $t('dashboard.returningUsers'), value: 34, color: '#52c41a' },
  { label: $t('dashboard.enterpriseUsers'), value: 20, color: '#fa8c16' }
])

const activities = computed(() => [
  {
    id: 1,
    action: $t('dashboard.activities.permissionUpdated'),
    time: $t('dashboard.minutesAgo', { value: 2 }),
    tag: $t('dashboard.activityTags.system'),
    tagColor: 'blue',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  },
  {
    id: 2,
    action: $t('dashboard.activities.userCreated'),
    time: $t('dashboard.minutesAgo', { value: 18 }),
    tag: $t('dashboard.activityTags.user'),
    tagColor: 'cyan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunny'
  },
  {
    id: 3,
    action: $t('dashboard.activities.orderTaskDone'),
    time: $t('dashboard.hoursAgo', { value: 1 }),
    tag: $t('dashboard.activityTags.task'),
    tagColor: 'green',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=job'
  },
  {
    id: 4,
    action: $t('dashboard.activities.riskPolicyReleased'),
    time: $t('dashboard.hoursAgo', { value: 2 }),
    tag: $t('dashboard.activityTags.release'),
    tagColor: 'purple',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=release'
  }
])

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 60000)
})

onBeforeUnmount(() => {
  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
})
</script>

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

    .stat-card {
      position: relative;
      overflow: hidden;
      min-height: 168px;
      padding: 20px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border-secondary);
      background: var(--color-bg-container);
      box-shadow: var(--shadow-card);
      transition: all var(--duration-slow) var(--ease-out);

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-card-hover);
      }

      .stat-label {
        font-size: 12px;
        color: var(--color-text-tertiary);
        margin-bottom: 10px;
      }

      .stat-value {
        margin: 0;
        font-size: 36px;
        line-height: 1;
        font-family: var(--font-family-number);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
        letter-spacing: -0.02em;
      }

      .stat-trend {
        margin-top: 14px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--color-success);
        font-weight: var(--font-weight-medium);
      }

      .stat-watermark {
        position: absolute;
        right: 14px;
        bottom: -6px;
        font-size: 96px;
        color: var(--accent-soft);
      }

      &.tone-blue {
        --accent-soft: rgba(24, 119, 255, 0.12);
      }

      &.tone-green {
        --accent-soft: rgba(82, 196, 26, 0.12);
      }

      &.tone-orange {
        --accent-soft: rgba(250, 140, 22, 0.12);
      }

      &.tone-purple {
        --accent-soft: rgba(114, 46, 209, 0.12);
      }
    }
  }

  .charts-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--spacing-md);

    .chart-card {
      min-height: 360px;
      display: flex;
      flex-direction: column;

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;

        .card-title {
          margin: 0;
          font-size: 18px;
          color: var(--color-text-primary);
        }
      }

      .chart-canvas {
        flex: 1;
        border-radius: 12px;
        border: 1px solid var(--color-border-secondary);
        background: linear-gradient(180deg, rgba(24, 119, 255, 0.03), rgba(24, 119, 255, 0));
        position: relative;
        overflow: hidden;
      }

      .line-canvas {
        padding: 18px;

        .line-grid {
          position: absolute;
          inset: 18px;
          background-image: linear-gradient(to bottom, rgba(15, 23, 42, 0.08) 1px, transparent 1px);
          background-size: 100% 22%;
        }

        .line-fill {
          position: absolute;
          left: 18px;
          right: 18px;
          bottom: 18px;
          z-index: 1;
          height: 44%;
          background: linear-gradient(180deg, rgba(24, 119, 255, 0.18), rgba(24, 119, 255, 0.03));
          clip-path: polygon(0 84%, 14% 70%, 28% 74%, 42% 58%, 56% 63%, 70% 44%, 84% 48%, 100% 30%, 100% 100%, 0 100%);
        }

        .bars {
          position: absolute;
          left: 18px;
          right: 18px;
          bottom: 18px;
          z-index: 2;
          height: 66%;
          display: grid;
          grid-template-columns: repeat(8, minmax(0, 1fr));
          align-items: end;
          gap: 12px;

          span {
            width: clamp(12px, 40%, 22px);
            justify-self: center;
            border-radius: 10px 10px 4px 4px;
            background: linear-gradient(180deg, rgba(24, 119, 255, 0.9), rgba(24, 119, 255, 0.32));
            border: 1px solid rgba(24, 119, 255, 0.28);
            box-shadow: 0 10px 16px rgba(24, 119, 255, 0.16);
            transition: transform var(--duration-base) var(--ease-out), box-shadow var(--duration-base) var(--ease-out);

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 20px rgba(24, 119, 255, 0.22);
            }
          }
        }
      }

      .donut-canvas {
        display: grid;
        place-items: center;
        padding: 20px;
        gap: 16px;

        .donut-ring {
          width: 164px;
          height: 164px;
          border-radius: 50%;
          background: conic-gradient(#1677ff 0 46%, #52c41a 46% 80%, #fa8c16 80% 100%);
          position: relative;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);

          &::after {
            content: '';
            position: absolute;
            inset: 26px;
            border-radius: 50%;
            background: var(--color-bg-container);
            border: 1px solid var(--color-border-secondary);
          }
        }

        .legend-list {
          width: min(280px, 100%);
          display: grid;
          gap: 10px;

          li {
            display: grid;
            grid-template-columns: 12px 1fr auto;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            color: var(--color-text-secondary);
          }

          .legend-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
          }

          .legend-value {
            font-family: var(--font-family-number);
            color: var(--color-text-primary);
            font-weight: var(--font-weight-semibold);
          }
        }
      }
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

@media (max-width: 1200px) {
  .dashboard-container {
    .stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .charts-grid {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 768px) {
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

      .stat-card {
        min-height: 150px;

        .stat-value {
          font-size: 32px;
        }
      }
    }
  }
}
</style>
