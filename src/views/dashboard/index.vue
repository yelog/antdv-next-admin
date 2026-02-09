<template>
  <div class="dashboard-container">
    <h1 class="page-title">{{ $t('dashboard.welcome') }}</h1>

    <!-- Statistics Cards -->
    <a-row :gutter="16" class="stats-row">
      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #e6f7ff; color: #1890ff;">
            <UserOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-value">12,458</div>
            <div class="stat-label">{{ $t('dashboard.totalUsers') }}</div>
          </div>
        </div>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #f6ffed; color: #52c41a;">
            <ShoppingOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-value">8,946</div>
            <div class="stat-label">{{ $t('dashboard.totalOrders') }}</div>
          </div>
        </div>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #fff7e6; color: #fa8c16;">
            <DollarOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-value">¥456,789</div>
            <div class="stat-label">{{ $t('dashboard.totalRevenue') }}</div>
          </div>
        </div>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #f9f0ff; color: #722ed1;">
            <RiseOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-value">3.24%</div>
            <div class="stat-label">{{ $t('dashboard.conversionRate') }}</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- Charts -->
    <a-row :gutter="16" class="charts-row">
      <a-col :xs="24" :lg="12">
        <div class="card">
          <h3 class="card-title">{{ $t('dashboard.salesTrend') }}</h3>
          <div class="chart-placeholder">
            <BarChartOutlined class="chart-icon" />
            <p>Chart will be here</p>
          </div>
        </div>
      </a-col>

      <a-col :xs="24" :lg="12">
        <div class="card">
          <h3 class="card-title">{{ $t('dashboard.userDistribution') }}</h3>
          <div class="chart-placeholder">
            <PieChartOutlined class="chart-icon" />
            <p>Chart will be here</p>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- Recent Activities -->
    <div class="card">
      <h3 class="card-title">{{ $t('dashboard.recentActivities') }}</h3>
      <a-list
        :data-source="activities"
        :loading="false"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :description="item.time">
              <template #title>{{ item.action }}</template>
              <template #avatar>
                <a-avatar :src="item.avatar" />
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
  .page-title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--spacing-xl);
    color: var(--color-text-primary);
  }

  .stats-row {
    margin-bottom: var(--spacing-xl);

    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      background: var(--color-bg-container);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      transition: all var(--duration-slow) var(--ease-out);

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-card-hover);
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-lg);
        font-size: 28px;
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }
      }
    }
  }

  .charts-row {
    margin-bottom: var(--spacing-xl);
  }

  .card {
    padding: var(--spacing-lg);
    background: var(--color-bg-container);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    margin-bottom: var(--spacing-lg);

    .card-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      margin-bottom: var(--spacing-md);
      color: var(--color-text-primary);
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
}
</style>
