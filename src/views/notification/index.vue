<template>
  <div class="notification-center page-container">
    <section class="hero-panel card">
      <div class="hero-glow hero-glow-a"></div>
      <div class="hero-glow hero-glow-b"></div>

      <div class="hero-main">
        <p class="hero-kicker">{{ $t('notificationCenter.kicker') }}</p>
        <h1 class="hero-title">{{ $t('notificationCenter.title') }}</h1>
        <p class="hero-subtitle">{{ $t('notificationCenter.subtitle') }}</p>
      </div>

      <div class="hero-metrics">
        <div class="metric-card">
          <span class="metric-label">{{ $t('notificationCenter.metrics.total') }}</span>
          <strong class="metric-value">{{ notifications.length }}</strong>
        </div>
        <div class="metric-card">
          <span class="metric-label">{{ $t('notificationCenter.metrics.unread') }}</span>
          <strong class="metric-value">{{ unreadCount }}</strong>
        </div>
        <div class="metric-card">
          <span class="metric-label">{{ $t('notificationCenter.metrics.today') }}</span>
          <strong class="metric-value">{{ todayCount }}</strong>
        </div>
      </div>

      <div class="hero-toolbar">
        <a-input
          v-model:value="keyword"
          allow-clear
          class="search-input"
          :placeholder="$t('notificationCenter.searchPlaceholder')"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>

        <a-radio-group v-model:value="readFilter" size="small">
          <a-radio-button value="all">{{ $t('notificationCenter.filters.allStatus') }}</a-radio-button>
          <a-radio-button value="unread">{{ $t('notificationCenter.filters.unread') }}</a-radio-button>
          <a-radio-button value="read">{{ $t('notificationCenter.filters.read') }}</a-radio-button>
        </a-radio-group>

        <a-select v-model:value="toneFilter" size="small" class="tone-select">
          <a-select-option value="all">{{ $t('notificationCenter.filters.allTypes') }}</a-select-option>
          <a-select-option value="system">{{ $t('notificationCenter.filters.system') }}</a-select-option>
          <a-select-option value="message">{{ $t('notificationCenter.filters.message') }}</a-select-option>
          <a-select-option value="security">{{ $t('notificationCenter.filters.security') }}</a-select-option>
          <a-select-option value="task">{{ $t('notificationCenter.filters.task') }}</a-select-option>
          <a-select-option value="error">{{ $t('notificationCenter.filters.error') }}</a-select-option>
        </a-select>
      </div>
    </section>

    <section class="center-content">
      <article class="list-panel card">
        <header class="panel-header">
          <div>
            <h2 class="panel-title">{{ $t('notificationCenter.listTitle') }}</h2>
            <p class="panel-subtitle">{{ $t('notificationCenter.listSubtitle', { count: filteredNotifications.length }) }}</p>
          </div>

          <a-button
            type="link"
            size="small"
            :disabled="unreadCount === 0"
            @click="notificationStore.markAllAsRead()"
          >
            {{ $t('layout.markAllRead') }}
          </a-button>
        </header>

        <div v-if="filteredNotifications.length > 0" class="notice-list">
          <button
            v-for="notification in filteredNotifications"
            :key="notification.id"
            type="button"
            :class="[
              'notice-item',
              `tone-${resolveTone(notification)}`,
              {
                active: selectedNotificationId === notification.id,
                unread: !notification.read
              }
            ]"
            @click="handleSelectNotification(notification)"
          >
            <div class="notice-icon">
              <component :is="getToneIcon(resolveTone(notification))" />
              <span v-if="!notification.read" class="notice-unread-dot" />
            </div>

            <div class="notice-main">
              <div class="notice-head">
                <h3 class="notice-title">{{ notification.title }}</h3>
                <span class="notice-time">{{ formatRelativeTime(notification.timestamp) }}</span>
              </div>
              <p class="notice-message">{{ notification.message }}</p>
            </div>
          </button>
        </div>

        <div v-else class="list-empty">
          <a-empty :description="$t('notificationCenter.emptyFiltered')" />
        </div>
      </article>

      <article class="detail-panel card">
        <template v-if="selectedNotification">
          <header class="detail-header">
            <div class="detail-title-wrap">
              <div :class="['detail-icon', `tone-${selectedTone}`]">
                <component :is="getToneIcon(selectedTone)" />
              </div>
              <div class="detail-title-content">
                <h2 class="detail-title">{{ selectedNotification.title }}</h2>
                <p class="detail-time">
                  {{ formatAbsoluteTime(selectedNotification.timestamp) }}
                  <span class="detail-time-divider">·</span>
                  {{ formatRelativeTime(selectedNotification.timestamp) }}
                </p>
              </div>
            </div>

            <div class="detail-header-actions">
              <a-tooltip v-if="!selectedNotification.read" :title="$t('notificationCenter.actions.markAsRead')">
                <a-button
                  type="text"
                  size="small"
                  @click="handleMarkAsRead(selectedNotification.id)"
                >
                  <template #icon><CheckCircleOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip :title="$t('notificationCenter.actions.delete')">
                <a-button
                  type="text"
                  size="small"
                  danger
                  @click="handleDeleteNotification(selectedNotification.id)"
                >
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-tooltip>
            </div>
          </header>

          <div class="detail-body">
            <p class="detail-message">{{ selectedNotification.message }}</p>

            <div class="detail-meta">
              <div class="meta-item">
                <span class="meta-label">{{ $t('notificationCenter.meta.type') }}</span>
                <span class="meta-value">{{ getToneLabel(selectedTone) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">{{ $t('notificationCenter.meta.receivedAt') }}</span>
                <span class="meta-value">{{ formatAbsoluteTime(selectedNotification.timestamp) }}</span>
              </div>
            </div>
          </div>

          <footer v-if="selectedNotification.link" class="detail-actions">
            <a-button
              type="primary"
              size="large"
              block
              @click="handleOpenRelated(selectedNotification)"
            >
              {{ $t('notificationCenter.actions.openRelated') }}
            </a-button>
          </footer>
        </template>

        <template v-else>
          <div class="detail-placeholder">
            <BellOutlined class="placeholder-icon" />
            <h3 class="placeholder-title">{{ $t('notificationCenter.placeholder.title') }}</h3>
            <p class="placeholder-desc">{{ $t('notificationCenter.placeholder.desc') }}</p>
          </div>
        </template>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  BellOutlined,
  RocketOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  DeleteOutlined
} from '@antdv-next/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { $t } from '@/locales'
import { useNotificationStore } from '@/stores/notification'
import type { Notification } from '@/types/layout'

dayjs.extend(relativeTime)

type ReadFilter = 'all' | 'unread' | 'read'
type NotificationTone = 'system' | 'message' | 'security' | 'task' | 'error'
type ToneFilter = 'all' | NotificationTone

const route = useRoute()
const router = useRouter()
const notificationStore = useNotificationStore()

const keyword = ref('')
const readFilter = ref<ReadFilter>('all')
const toneFilter = ref<ToneFilter>('all')

const notifications = computed(() => {
  return [...notificationStore.notifications].sort((a, b) => b.timestamp - a.timestamp)
})

const unreadCount = computed(() => notifications.value.filter(item => !item.read).length)
const todayCount = computed(() => notifications.value.filter(item => dayjs(item.timestamp).isSame(dayjs(), 'day')).length)

const selectedNotificationId = computed(() => {
  const queryValue = route.query.id
  const raw = Array.isArray(queryValue) ? queryValue[0] : queryValue
  return raw ? String(raw) : ''
})

const normalizeText = (value: string) => value.trim().toLowerCase()

const resolveTone = (notification: Notification): NotificationTone => {
  // Use category if explicitly set
  if (notification.category) {
    return notification.category
  }

  // Fallback to type-based classification
  switch (notification.type) {
    case 'warning':
      return 'security'
    case 'success':
      return 'task'
    case 'error':
      return 'error'
    default:
      return 'system'
  }
}

const filteredNotifications = computed(() => {
  const query = normalizeText(keyword.value)

  return notifications.value.filter((notification) => {
    if (readFilter.value === 'unread' && notification.read) return false
    if (readFilter.value === 'read' && !notification.read) return false

    const tone = resolveTone(notification)
    if (toneFilter.value !== 'all' && tone !== toneFilter.value) return false

    if (!query) return true

    const merged = `${notification.title} ${notification.message}`.toLowerCase()
    return merged.includes(query)
  })
})

const selectedNotification = computed(() => {
  if (!selectedNotificationId.value) {
    return null
  }
  return notifications.value.find(item => item.id === selectedNotificationId.value) || null
})

const selectedTone = computed<NotificationTone>(() => {
  if (!selectedNotification.value) {
    return 'system'
  }
  return resolveTone(selectedNotification.value)
})

watch(
  selectedNotification,
  (notification) => {
    if (notification && !notification.read) {
      notificationStore.markAsRead(notification.id)
    }
  },
  { immediate: true }
)

const getToneIcon = (tone: NotificationTone) => {
  if (tone === 'system') return RocketOutlined
  if (tone === 'message') return MailOutlined
  if (tone === 'security') return SafetyCertificateOutlined
  if (tone === 'task') return CheckCircleOutlined
  if (tone === 'error') return ExclamationCircleOutlined
  return BellOutlined
}

const getToneLabel = (tone: NotificationTone) => {
  if (tone === 'system') return $t('notificationCenter.filters.system')
  if (tone === 'message') return $t('notificationCenter.filters.message')
  if (tone === 'security') return $t('notificationCenter.filters.security')
  if (tone === 'task') return $t('notificationCenter.filters.task')
  return $t('notificationCenter.filters.error')
}

const formatRelativeTime = (timestamp: number) => dayjs(timestamp).fromNow()
const formatAbsoluteTime = (timestamp: number) => dayjs(timestamp).format('YYYY-MM-DD HH:mm')

const handleSelectNotification = (notification: Notification) => {
  if (!notification.read) {
    notificationStore.markAsRead(notification.id)
  }

  if (selectedNotificationId.value === notification.id) {
    return
  }

  router.replace({
    path: '/notifications',
    query: { id: notification.id }
  })
}

const handleMarkAsRead = (id: string) => {
  notificationStore.markAsRead(id)
}

const handleDeleteNotification = (id: string) => {
  notificationStore.removeNotification(id)

  if (selectedNotificationId.value === id) {
    router.replace({ path: '/notifications' })
  }
}

const handleOpenRelated = (notification: Notification) => {
  if (!notification.link) {
    return
  }

  if (/^https?:\/\//.test(notification.link)) {
    window.open(notification.link, '_blank', 'noopener,noreferrer')
    return
  }

  router.push(notification.link)
}
</script>

<style scoped lang="scss">
.notification-center {
  display: grid;
  gap: var(--spacing-lg);
}

.hero-panel {
  position: relative;
  overflow: hidden;
  padding: 24px;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--color-bg-container) 0%, var(--color-primary-1) 58%, var(--color-bg-container) 100%);

  .hero-glow {
    position: absolute;
    border-radius: 999px;
    filter: blur(8px);
    pointer-events: none;
  }

  .hero-glow-a {
    width: 220px;
    height: 220px;
    right: -84px;
    top: -100px;
    background: radial-gradient(circle, rgba(22, 119, 255, 0.24) 0%, rgba(22, 119, 255, 0.02) 70%);
  }

  .hero-glow-b {
    width: 180px;
    height: 180px;
    left: 44%;
    bottom: -96px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.02) 72%);
  }
}

.hero-main {
  position: relative;
  z-index: 1;
}

.hero-kicker {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary);
  font-weight: 600;
}

.hero-title {
  margin: 0;
  font-size: clamp(24px, 2.4vw, 34px);
  line-height: 1.2;
  font-weight: 700;
  color: var(--color-text-primary);
}

.hero-subtitle {
  margin: 10px 0 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  max-width: 760px;
  line-height: 1.7;
}

.hero-metrics {
  margin-top: 18px;
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  padding: 14px 14px 12px;
  border-radius: 12px;
  border: 1px solid var(--color-border-secondary);
  background: color-mix(in srgb, var(--color-bg-container) 72%, transparent);
  backdrop-filter: blur(2px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.metric-label {
  display: block;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.metric-value {
  margin-top: 6px;
  display: block;
  font-family: var(--font-family-number);
  font-size: 32px;
  line-height: 1.2;
  font-weight: 600;
  color: var(--color-text-primary);
}

.hero-toolbar {
  margin-top: 14px;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: min(320px, 100%);
}

.tone-select {
  min-width: 136px;
}

.center-content {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 16px;
  align-items: start;
}

.list-panel,
.detail-panel {
  border-radius: 16px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.panel-title {
  margin: 0;
  font-size: 16px;
  color: var(--color-text-primary);
}

.panel-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.notice-list {
  display: grid;
  gap: 8px;
  max-height: 650px;
  overflow-y: auto;
  padding: 2px 2px 2px 0;
}

.notice-item {
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  background: var(--color-bg-container);
  padding: 12px;
  text-align: left;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);

  &:hover {
    transform: translateY(-1px);
    background: rgba(22, 119, 255, 0.02);
    border-color: rgba(22, 119, 255, 0.26);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
  }

  &.active {
    border-color: var(--color-primary);
    background: rgba(22, 119, 255, 0.06);
    box-shadow: 0 2px 8px rgba(22, 119, 255, 0.12);
  }

  &.unread .notice-title {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &:not(.unread) {
    opacity: 0.75;

    .notice-title {
      color: var(--color-text-secondary);
      font-weight: 400;
    }

    .notice-message {
      color: var(--color-text-tertiary);
    }
  }
}

.notice-icon {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  flex: 0 0 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  position: relative;
}

.notice-unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #ef4444;
  position: absolute;
  right: -2px;
  top: -2px;
  box-shadow: 0 0 0 2px var(--color-bg-container);
}

.notice-main {
  min-width: 0;
  flex: 1;
}

.notice-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.notice-title {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-time {
  flex: 0 0 auto;
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.notice-message {
  margin: 5px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.detail-panel {
  position: sticky;
  top: 10px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border-secondary);
}

.detail-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.detail-title-content {
  flex: 1;
  min-width: 0;
}

.detail-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.detail-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex: 0 0 36px;
}

.detail-title {
  margin: 0;
  font-size: 19px;
  line-height: 1.3;
  color: var(--color-text-primary);
}

.detail-time {
  margin: 7px 0 0;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.detail-time-divider {
  margin: 0 4px;
}

.detail-body {
  margin-top: 14px;
}

.detail-message {
  margin: 0;
  padding: 14px 14px 12px;
  border-radius: 12px;
  background: linear-gradient(145deg, var(--color-bg-layout), rgba(22, 119, 255, 0.04));
  border: 1px solid var(--color-border-secondary);
  color: var(--color-text-secondary);
  line-height: 1.8;
  font-size: 14px;
}

.detail-meta {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.meta-item {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--color-border-secondary);
  background: var(--color-bg-container);
}

.meta-label {
  display: block;
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.meta-value {
  margin-top: 6px;
  display: block;
  font-size: 13px;
  color: var(--color-text-primary);
}

.detail-actions {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-secondary);
}

.detail-placeholder {
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  color: var(--color-text-secondary);
}

.placeholder-icon {
  font-size: 34px;
  color: var(--color-primary);
  margin-bottom: 10px;
}

.placeholder-title {
  margin: 0;
  font-size: 18px;
  color: var(--color-text-primary);
}

.placeholder-desc {
  margin: 8px 0 0;
  max-width: 360px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--color-text-tertiary);
}

.list-empty {
  padding: 40px 0 30px;
}

.notice-icon.tone-system,
.detail-icon.tone-system {
  color: #1677ff;
  background: rgba(22, 119, 255, 0.13);
}

.notice-icon.tone-message,
.detail-icon.tone-message {
  color: #16a34a;
  background: rgba(22, 163, 74, 0.14);
}

.notice-icon.tone-security,
.detail-icon.tone-security {
  color: #f97316;
  background: rgba(249, 115, 22, 0.18);
}

.notice-icon.tone-task,
.detail-icon.tone-task {
  color: #0f766e;
  background: rgba(15, 118, 110, 0.14);
}

.notice-icon.tone-error,
.detail-icon.tone-error {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.14);
}

/* ===== Dark Mode ===== */
:root.dark {
  .hero-panel {
    background: linear-gradient(135deg, var(--color-bg-container) 0%, color-mix(in srgb, var(--color-primary) 12%, var(--color-bg-container)) 58%, var(--color-bg-container) 100%);
  }

  .metric-card {
    background: color-mix(in srgb, var(--color-bg-container) 85%, transparent);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  }

  .notice-item {
    &:hover {
      background: color-mix(in srgb, var(--color-primary) 6%, var(--color-bg-container));
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    &.active {
      background: color-mix(in srgb, var(--color-primary) 10%, var(--color-bg-container));
      box-shadow: 0 2px 8px rgba(22, 119, 255, 0.2);
    }
  }
}

@media (max-width: 1200px) {
  .center-content {
    grid-template-columns: 1fr;
  }

  .detail-panel {
    position: static;
  }
}

@media (max-width: 768px) {
  .hero-panel {
    padding: 16px;
    border-radius: 14px;
  }

  .hero-metrics {
    grid-template-columns: 1fr;
  }

  .hero-toolbar {
    gap: 8px;
  }

  .search-input {
    width: 100%;
  }

  .tone-select {
    width: 100%;
  }

  .detail-placeholder {
    min-height: 280px;
  }

  .detail-meta {
    grid-template-columns: 1fr;
  }
}
</style>
