<template>
  <a-popover
    v-model:open="popoverOpen"
    trigger="click"
    placement="bottomRight"
    :arrow="false"
    :overlay-style="{ paddingTop: '8px' }"
    overlay-class-name="notification-popover-overlay"
  >
    <a-badge :dot="notificationStore.unreadCount > 0" :offset="[-5, 5]">
      <a-button type="text" class="header-action">
        <BellOutlined />
      </a-button>
    </a-badge>
    <template #content>
      <div class="notification-panel">
        <div class="panel-header">
          <div class="header-left">
            <span class="title">{{ $t('layout.notifications') }}</span>
            <span v-if="notificationStore.unreadCount > 0" class="unread-pill">
              {{ notificationStore.unreadCount }}
            </span>
          </div>
          <a-space size="small">
            <a-button
              type="link"
              size="small"
              :disabled="notificationStore.unreadCount === 0"
              @click="handleMarkAllRead"
            >
              {{ $t('layout.markAllRead') }}
            </a-button>
            <a-button
              type="link"
              size="small"
              :disabled="notificationStore.notifications.length === 0"
              @click="handleClearAll"
            >
              {{ $t('layout.clearAll') }}
            </a-button>
          </a-space>
        </div>

        <div class="panel-body">
          <template v-if="displayedNotifications.length > 0">
            <div
              v-for="notification in displayedNotifications"
              :key="notification.id"
              :class="[
                'notification-item',
                { unread: !notification.read },
                `tone-${getNotificationTone(notification)}`
              ]"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-icon" aria-hidden="true">
                <component :is="getNotificationIcon(notification)" />
                <span v-if="!notification.read" class="icon-unread-dot" />
              </div>

              <div class="notification-content">
                <div class="notification-meta">
                  <div class="notification-title-row">
                    <div class="notification-title">{{ notification.title }}</div>
                  </div>
                  <div class="notification-time">
                    {{ formatTime(notification.timestamp) }}
                  </div>
                </div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-detail-hint">{{ $t('layout.viewDetails') }}</div>
              </div>

              <a-button
                type="text"
                size="small"
                class="notification-remove-btn"
                :title="$t('common.close')"
                @click.stop="handleRemoveNotification(notification.id)"
              >
                <CloseOutlined />
              </a-button>
            </div>
          </template>
          <div v-else class="notification-empty">
            <div class="empty-illustration">
              <BellOutlined class="empty-icon" />
              <span class="empty-dot" />
            </div>
            <div class="empty-title">{{ $t('layout.noNotifications') }}</div>
            <div class="empty-subtitle">{{ $t('layout.notificationsEmptyHint') }}</div>
          </div>
        </div>

        <div class="panel-footer">
          <a-button type="link" class="view-all-btn" @click="handleViewAll">
            {{ $t('layout.viewAllNotifications') }}
            <RightOutlined />
          </a-button>
        </div>
      </div>
    </template>
  </a-popover>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  BellOutlined,
  RocketOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseOutlined,
  RightOutlined
} from '@antdv-next/icons'
import { useNotificationStore } from '@/stores/notification'
import type { Notification } from '@/types/layout'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import router from '@/router'

dayjs.extend(relativeTime)

const notificationStore = useNotificationStore()
const popoverOpen = ref(false)

const displayedNotifications = computed(() => {
  return notificationStore.notifications.slice(0, 10)
})

const formatTime = (timestamp: number) => {
  return dayjs(timestamp).fromNow()
}

const getNotificationTone = (notification: Notification) => {
  // Use category if explicitly set
  if (notification.category) {
    return notification.category
  }

  // Fallback to type-based classification
  switch (notification.type) {
    case 'success':
      return 'task'
    case 'warning':
      return 'security'
    case 'error':
      return 'error'
    default:
      return 'system'
  }
}

const getNotificationIcon = (notification: Notification) => {
  const tone = getNotificationTone(notification)

  if (tone === 'system') return RocketOutlined
  if (tone === 'message') return MailOutlined
  if (tone === 'security') return SafetyCertificateOutlined
  if (tone === 'task') return CheckCircleOutlined
  if (tone === 'error') return ExclamationCircleOutlined
  return BellOutlined
}

const handleNotificationClick = (notification: Notification) => {
  notificationStore.markAsRead(notification.id)
  popoverOpen.value = false
  router.push({
    path: '/notifications',
    query: {
      id: notification.id
    }
  })
}

const handleRemoveNotification = (id: string) => {
  notificationStore.removeNotification(id)
}

const handleMarkAllRead = () => {
  notificationStore.markAllAsRead()
}

const handleClearAll = () => {
  notificationStore.clearAll()
}

const handleViewAll = () => {
  popoverOpen.value = false
  router.push('/notifications')
}
</script>

<style scoped lang="scss">
.notification-panel {
  width: 392px;
  max-height: 560px;
  background: var(--color-bg-container);
  border-radius: 12px;
  overflow: hidden;

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--color-border-secondary);
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.03), transparent);

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .title {
      font-weight: var(--font-weight-semibold);
      font-size: 15px;
      color: var(--color-text-primary);
    }

    .unread-pill {
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-primary-7);
      background: var(--color-primary-1);
      border: 1px solid var(--color-primary-2);
    }
  }

  .panel-body {
    max-height: 404px;
    overflow-y: auto;
    padding: 10px;
    scrollbar-width: thin;
    scrollbar-color: rgba(15, 23, 42, 0.2) transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 999px;
      background: rgba(100, 116, 139, 0.28);
    }

    &:hover::-webkit-scrollbar-thumb {
      background: rgba(100, 116, 139, 0.4);
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px;
      border-radius: 10px;
      cursor: pointer;
      transition: background var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out);

      & + .notification-item {
        border-top: 1px solid var(--color-border-secondary);
      }

      &:hover {
        background: var(--color-bg-layout);
      }

      &.unread {
        background: var(--color-primary-1);
      }

      .notification-icon {
        position: relative;
        flex: 0 0 27px;
        width: 27px;
        height: 27px;
        border-radius: 9px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }

      .icon-unread-dot {
        position: absolute;
        right: -2px;
        top: -2px;
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: #ef4444;
        box-shadow: 0 0 0 2px var(--color-bg-container);
      }

      .notification-content {
        flex: 1;
        min-width: 0;

        .notification-meta {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 4px;
        }

        .notification-title-row {
          display: flex;
          align-items: center;
          min-width: 0;
        }

        .notification-title {
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
          color: var(--color-text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .notification-message {
          font-size: 12px;
          line-height: 1.7;
          color: var(--color-text-secondary);
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }

        .notification-time {
          flex: 0 0 auto;
          font-size: 11px;
          color: var(--color-text-tertiary);
          line-height: 18px;
          white-space: nowrap;
        }

        .notification-detail-hint {
          margin-top: 6px;
          font-size: 12px;
          line-height: 16px;
          color: var(--color-primary-7);
          opacity: 0;
          transform: translateY(2px);
          transition: opacity var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out);
        }
      }

      .notification-remove-btn {
        width: 24px;
        height: 24px;
        margin-top: -2px;
        border-radius: 999px;
        color: var(--color-text-tertiary);
        opacity: 0;
        transition: opacity var(--duration-base) var(--ease-out), background var(--duration-base) var(--ease-out);

        &:hover {
          color: var(--color-text-secondary);
          background: var(--color-bg-layout);
        }
      }

      &:hover .notification-remove-btn {
        opacity: 1;
      }

      &:hover .notification-title {
        color: var(--color-primary-7);
      }

      &:hover .notification-detail-hint {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .tone-system .notification-icon {
      color: #1677ff;
      background: rgba(22, 119, 255, 0.12);
    }

    .tone-message .notification-icon {
      color: #22a06b;
      background: rgba(34, 160, 107, 0.14);
    }

    .tone-security .notification-icon {
      color: #f97316;
      background: rgba(249, 115, 22, 0.18);
    }

    .tone-task .notification-icon {
      color: #0f766e;
      background: rgba(15, 118, 110, 0.14);
    }

    .tone-error .notification-icon {
      color: #dc2626;
      background: rgba(220, 38, 38, 0.14);
    }

    .notification-empty {
      padding: 44px 20px 48px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .empty-illustration {
        position: relative;
        width: 72px;
        height: 72px;
        border-radius: 20px;
        background: linear-gradient(145deg, rgba(22, 119, 255, 0.16), rgba(22, 119, 255, 0.04));
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 14px;
      }

      .empty-icon {
        font-size: 32px;
        color: var(--color-primary);
      }

      .empty-dot {
        position: absolute;
        right: 14px;
        top: 14px;
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.18);
      }

      .empty-title {
        font-size: 14px;
        line-height: 22px;
        color: var(--color-text-primary);
        font-weight: 600;
      }

      .empty-subtitle {
        margin-top: 4px;
        font-size: 12px;
        line-height: 20px;
        color: var(--color-text-tertiary);
      }
    }
  }

  .panel-footer {
    padding: 10px 14px 12px;
    border-top: 1px solid var(--color-border-secondary);
    background: linear-gradient(180deg, transparent, rgba(15, 23, 42, 0.02));

    .view-all-btn {
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      height: 34px;
      border-radius: 8px;
      font-size: 13px;
      color: var(--color-primary-7);

      &:hover {
        background: rgba(22, 119, 255, 0.08);
      }
    }
  }
}
</style>

<style lang="scss">
.notification-popover-overlay {
  .ant-popover-inner {
    border-radius: 12px;
    border: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow: 0 28px 72px rgba(15, 23, 42, 0.18), 0 6px 18px rgba(15, 23, 42, 0.08);
    overflow: hidden;
  }

  .ant-popover-inner-content {
    padding: 0;
  }
}
</style>
