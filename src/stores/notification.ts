import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification } from '@/types/layout'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref<Notification[]>([])

  // Getters
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => !n.read)
  })

  const readNotifications = computed(() => {
    return notifications.value.filter(n => n.read)
  })

  // Actions
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
      ...notification
    }

    notifications.value.unshift(newNotification)
  }

  const markAsRead = (id: string) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach(n => {
      n.read = true
    })
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  const clearRead = () => {
    notifications.value = notifications.value.filter(n => !n.read)
  }

  const initNotifications = () => {
    // 模拟通知数据
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: '系统更新',
        message: '系统已更新到最新版本 v2.0.0，新增了多项功能优化',
        type: 'info',
        timestamp: Date.now() - 1000 * 60 * 5, // 5分钟前
        read: false,
        link: '/dashboard'
      },
      {
        id: '2',
        title: '新消息',
        message: '您有一条来自管理员的新消息，请及时查看',
        type: 'success',
        timestamp: Date.now() - 1000 * 60 * 30, // 30分钟前
        read: false,
        link: '/profile'
      },
      {
        id: '3',
        title: '安全提醒',
        message: '检测到您的账号在异地登录，如非本人操作请及时修改密码',
        type: 'warning',
        timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
        read: false,
        link: '/profile'
      },
      {
        id: '4',
        title: '任务完成',
        message: '数据导出任务已完成，共导出 1,234 条记录',
        type: 'success',
        timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5小时前
        read: true,
        link: '/examples/table'
      },
      {
        id: '5',
        title: '系统维护通知',
        message: '系统将于今晚 22:00-24:00 进行维护，期间可能无法访问',
        type: 'warning',
        timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1天前
        read: true,
        link: '/dashboard'
      }
    ]

    notifications.value = mockNotifications
  }

  return {
    // State
    notifications,
    // Getters
    unreadCount,
    unreadNotifications,
    readNotifications,
    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    clearRead,
    initNotifications
  }
})
