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
    clearRead
  }
})
