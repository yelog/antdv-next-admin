<template>
  <a-dropdown :trigger="['click']">
    <a-badge :count="notificationStore.unreadCount" :offset="[-5, 5]">
      <a-button type="text" class="header-action">
        <BellOutlined />
      </a-button>
    </a-badge>
    <template #overlay>
      <div class="notification-panel">
        <div class="panel-header">
          <span class="title">{{ $t('layout.notifications') }}</span>
          <a-space>
            <a-button type="link" size="small" @click="handleMarkAllRead">
              {{ $t('layout.markAllRead') }}
            </a-button>
            <a-button type="link" size="small" @click="handleClearAll">
              {{ $t('layout.clearAll') }}
            </a-button>
          </a-space>
        </div>

        <div class="panel-body">
          <template v-if="notificationStore.notifications.length > 0">
            <div
              v-for="notification in notificationStore.notifications.slice(0, 10)"
              :key="notification.id"
              :class="['notification-item', { unread: !notification.read }]"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-time">
                  {{ formatTime(notification.timestamp) }}
                </div>
              </div>
            </div>
          </template>
          <a-empty v-else :description="$t('layout.noNotifications')" />
        </div>
      </div>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { BellOutlined } from '@antdv-next/icons'
import { useNotificationStore } from '@/stores/notification'
import type { Notification } from '@/types/layout'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const notificationStore = useNotificationStore()

const formatTime = (timestamp: number) => {
  return dayjs(timestamp).fromNow()
}

const handleNotificationClick = (notification: Notification) => {
  notificationStore.markAsRead(notification.id)
  if (notification.link) {
    // Navigate to link
  }
}

const handleMarkAllRead = () => {
  notificationStore.markAllAsRead()
}

const handleClearAll = () => {
  notificationStore.clearAll()
}
</script>

<style scoped lang="scss">
.notification-panel {
  width: 360px;
  max-height: 500px;
  background: var(--color-bg-container);

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border-secondary);

    .title {
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-base);
    }
  }

  .panel-body {
    max-height: 400px;
    overflow-y: auto;

    .notification-item {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--color-border-secondary);
      cursor: pointer;
      transition: background var(--duration-base) var(--ease-out);

      &:hover {
        background: var(--color-bg-layout);
      }

      &.unread {
        background: var(--color-primary-1);
      }

      .notification-content {
        .notification-title {
          font-weight: var(--font-weight-medium);
          margin-bottom: var(--spacing-xs);
        }

        .notification-message {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          margin-bottom: var(--spacing-xs);
        }

        .notification-time {
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
        }
      }
    }
  }
}
</style>
