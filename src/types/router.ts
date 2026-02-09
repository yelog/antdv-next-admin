import type { RouteRecordRaw } from 'vue-router'

// Route Meta Custom Types
export interface RouteMeta {
  title: string
  icon?: string
  requiresAuth?: boolean
  requiredPermissions?: string[]
  requiredRoles?: string[]
  keepAlive?: boolean
  hidden?: boolean
  order?: number
  affix?: boolean // Pin tab (cannot be closed)
  badge?: string | number
  activeMenu?: string
}

export interface AppRouteRecordRaw extends Omit<RouteRecordRaw, 'meta' | 'children'> {
  meta?: RouteMeta
  children?: AppRouteRecordRaw[]
}

// Menu Item Types
export interface MenuItem {
  id: string
  label: string
  icon?: string
  path?: string
  badge?: string | number
  requiredPermissions?: string[]
  requiredRoles?: string[]
  children?: MenuItem[]
  meta?: RouteMeta
}

// Backend Route Config (from API)
export interface RouteConfig {
  id: string
  name: string
  path: string
  component: string
  redirect?: string
  meta?: RouteMeta
  children?: RouteConfig[]
}
