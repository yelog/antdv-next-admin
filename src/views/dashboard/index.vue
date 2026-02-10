<template>
  <div class="dashboard-container">
    <!-- Page Header with Enhanced Visual Hierarchy -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">{{ $t('dashboard.welcome') }}</h1>
          <p class="page-subtitle">实时监控您的业务数据和系统运行状态</p>
        </div>
        <div class="header-right">
          <a-avatar :size="56" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <template #icon><UserOutlined /></template>
          </a-avatar>
        </div>
      </div>
    </div>

    <!-- Statistics Cards with Enhanced Design -->
    <a-row :gutter="24" class="stats-row">
      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon" style="background: rgba(24, 144, 255, 0.1); color: #1890ff;">
              <UserOutlined />
            </div>
            <div class="stat-icon-watermark" style="color: rgba(24, 144, 255, 0.05);">
              <UserOutlined />
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-label">{{ $t('dashboard.totalUsers') }}</div>
            <div class="stat-value">12,458</div>
            <div class="stat-trend positive">
              <RiseOutlined /> +12.5%
            </div>
          </div>
        </div>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon" style="background: rgba(82, 196, 26, 0.1); color: #52c41a;">
              <ShoppingOutlined />
            </div>
            <div class="stat-icon-watermark" style="color: rgba(82, 196, 26, 0.05);">
              <ShoppingOutlined />
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-label">{{ $t('dashboard.totalOrders') }}</div>
            <div class="stat-value">8,946</div>
            <div class="stat-trend positive">
              <RiseOutlined /> +8.2%
            </div>
          </div>
        </div>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon" style="background: rgba(250, 140, 22, 0.1); color: #fa8c16;">
              <DollarOutlined />
            </div>
            <div class="stat-icon-watermark" style="color: rgba(250, 140, 22, 0.05);">
              <DollarOutlined />
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-label">{{ $t('dashboard.totalRevenue') }}</div>
            <div class="stat-value">¥456,789</div>
            <div class="stat-trend positive">
              <RiseOutlined /> +15.3%
            </div>
          </div>
        </div>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon" style="background: rgba(114, 46, 209, 0.1); color: #722ed1;">
              <RiseOutlined />
            </div>
            <div class="stat-icon-watermark" style="color: rgba(114, 46, 209, 0.05);">
              <RiseOutlined />
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-label">{{ $t('dashboard.conversionRate') }}</div>
            <div class="stat-value">3.24%</div>
            <div class="stat-trend positive">
              <RiseOutlined /> +0.8%
            </div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- Charts with Asymmetric Layout (2:1 ratio) -->
    <a-row :gutter="24" class="charts-row">
      <a-col :xs="24" :lg="16">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">{{ $t('dashboard.salesTrend') }}</h3>
            <a-button type="link" size="small">查看详情</a-button>
          </div>
          <a-skeleton active :paragraph="{ rows: 6 }" />
        </div>
      </a-col>

      <a-col :xs="24" :lg="8">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">{{ $t('dashboard.userDistribution') }}</h3>
          </div>
          <a-skeleton active :paragraph="{ rows: 6 }" />
        </div>
      </a-col>
    </a-row>

    <!-- Recent Activities -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">{{ $t('dashboard.recentActivities') }}</h3>
        <a-button type="link" size="small">查看全部</a-button>
      </div>
      <a-list
        :data-source="activities"
        :loading="false"
        class="activities-list"
      >
        <template #renderItem="{ item }">
          <a-list-item class="activity-item">
            <a-list-item-meta>
              <template #title>
                <span class="activity-title">{{ item.action }}</span>
              </template>
              <template #description>
                <span class="activity-time">{{ item.time }}</span>
              </template>
              <template #avatar>
                <a-avatar :src="item.avatar" :size="40" />
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RiseOutlined,
  BarChartOutlined,
  PieChartOutlined
} from '@antdv-next/icons'

const activities = ref([
  { id: 1, action: 'User John created a new order', time: '2 minutes ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john' },
  { id: 2, action: 'Admin updated system settings', time: '1 hour ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
  { id: 3, action: 'New user registered', time: '3 hours ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=new' },
  { id: 4, action: 'System backup completed', time: '5 hours ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system' }
])
</script>

<style scoped lang="scss">
.dashboard-container {
  // Page Header with Enhanced Visual Design
  .page-header {
    margin-bottom: 32px;
    padding: 28px 32px;
    background: var(--color-bg-container);
    border-radius: 10px;
    border: none;
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-left {
        flex: 1;

        .page-title {
          font-size: 32px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.88);
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .page-subtitle {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.45);
          margin: 0;
        }
      }

      .header-right {
        margin-left: 24px;
      }
    }
  }

  // Statistics Cards with Professional Design
  .stats-row {
    margin-bottom: 24px;

    .stat-card {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 24px;
      background: var(--color-bg-container);
      border-radius: 10px;
      border: none;
      box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      min-height: 140px;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 30px 0 rgba(0, 0, 0, 0.08);
      }

      .stat-icon-wrapper {
        position: relative;
        margin-bottom: 16px;

        .stat-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 24px;
          position: relative;
          z-index: 2;
        }

        .stat-icon-watermark {
          position: absolute;
          right: 0;
          top: -10px;
          font-size: 100px;
          opacity: 1;
          pointer-events: none;
        }
      }

      .stat-content {
        flex: 1;

        .stat-label {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.45);
          margin-bottom: 8px;
          font-weight: 400;
        }

        .stat-value {
          font-size: 30px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.88);
          margin-bottom: 8px;
          line-height: 1;
          font-family: 'DIN Alternate', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .stat-trend {
          font-size: 13px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;

          &.positive {
            color: #52c41a;
          }

          &.negative {
            color: #ff4d4f;
          }
        }
      }
    }
  }

  // Charts Section with Asymmetric Layout
  .charts-row {
    margin-bottom: 24px;
  }

  // Card Component with Enhanced Design
  .card {
    padding: 24px;
    background: var(--color-bg-container);
    border-radius: 10px;
    border: none;
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      box-shadow: 0 6px 30px 0 rgba(0, 0, 0, 0.08);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.88);
      margin: 0;
    }

    .chart-placeholder {
      height: 300px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary);

      .chart-icon {
        font-size: 64px;
        margin-bottom: var(--spacing-md);
      }
    }
  }

  // Activities List
  .activities-list {
    :deep(.ant-list-item) {
      padding: 16px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.02);
        padding-left: 12px;
        padding-right: 12px;
        margin-left: -12px;
        margin-right: -12px;
        border-radius: 8px;
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .activity-title {
      font-size: 14px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.88);
    }

    .activity-time {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
    }
  }
}

// Dark Mode Support
:deep(.dark) {
  .dashboard-container {
    .page-header {
      background: var(--color-bg-container);
      box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
    }

    .page-title {
      color: rgba(255, 255, 255, 0.88) !important;
    }

    .page-subtitle {
      color: rgba(255, 255, 255, 0.45) !important;
    }

    .stat-card,
    .card {
      background: var(--color-bg-container);
      box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
    }

    .stat-value,
    .card-title,
    .activity-title {
      color: rgba(255, 255, 255, 0.88) !important;
    }

    .stat-label,
    .activity-time {
      color: rgba(255, 255, 255, 0.45) !important;
    }
  }
}
</style>
