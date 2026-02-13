// Layout Types

export interface Tab {
  id: string
  // Route name, used by keep-alive include
  name: string
  // i18n message key or plain title text for display
  title?: string
  // Route meta icon key for tab display
  icon?: string
  path: string
  fullPath: string
  query?: Record<string, any>
  params?: Record<string, any>
  closable: boolean
  // User pinned tab (cannot be closed by batch close actions)
  pinned?: boolean
  affix?: boolean
}

export type NotificationCategory = 'system' | 'message' | 'security' | 'task' | 'error'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  category?: NotificationCategory
  timestamp: number
  read: boolean
  avatar?: string
  link?: string
}

export interface BreadcrumbItem {
  label: string
  path?: string
  icon?: string
}

export type ThemeMode = 'light' | 'dark' | 'system'
export type LayoutMode = 'vertical' | 'horizontal'
export type SidebarTheme = 'light' | 'dark'
export type PrimaryColor = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'cyan'
export type PageAnimation =
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'zoom'
  | 'zoom-big'
  | 'none'
