// Layout Types

export interface Tab {
  id: string
  // Route name, used by keep-alive include
  name: string
  // i18n message key or plain title text for display
  title?: string
  path: string
  fullPath: string
  query?: Record<string, any>
  params?: Record<string, any>
  closable: boolean
  affix?: boolean
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
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
export type PageAnimation = 'fade' | 'slide-left' | 'slide-right' | 'zoom' | 'zoom-big' | 'none'
