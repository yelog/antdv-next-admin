import type { AppRouteRecordRaw, MenuItem, RouteConfig } from '@/types/router'

function resolveRoutePath(path: string, basePath = ''): string {
  if (!path) {
    return basePath || '/'
  }

  if (path.startsWith('/')) {
    return path
  }

  const normalizedBase = basePath === '/' ? '' : basePath.replace(/\/$/, '')
  const resolved = `${normalizedBase}/${path}`.replace(/\/+/g, '/')
  return resolved.startsWith('/') ? resolved : `/${resolved}`
}

/**
 * Filter routes by permissions
 */
export function filterRoutesByPermission(
  routes: AppRouteRecordRaw[],
  permissions: string[]
): AppRouteRecordRaw[] {
  const hasAllPermission = permissions.includes('*')

  return routes.filter(route => {
    if (route.meta?.requiredPermissions && !hasAllPermission) {
      const hasPermission = route.meta.requiredPermissions.some(perm =>
        permissions.includes(perm)
      )
      if (!hasPermission) return false
    }

    if (route.children) {
      route.children = filterRoutesByPermission(route.children, permissions)
      // Remove parent if no children
      if (route.children.length === 0 && route.redirect) {
        return false
      }
    }

    return true
  })
}

/**
 * Filter routes by roles
 */
export function filterRoutesByRole(
  routes: AppRouteRecordRaw[],
  roles: string[]
): AppRouteRecordRaw[] {
  return routes.filter(route => {
    if (route.meta?.requiredRoles) {
      const hasRole = route.meta.requiredRoles.some(role =>
        roles.includes(role)
      )
      if (!hasRole) return false
    }

    if (route.children) {
      route.children = filterRoutesByRole(route.children, roles)
      // Remove parent if no children
      if (route.children.length === 0 && route.redirect) {
        return false
      }
    }

    return true
  })
}

/**
 * Convert routes to menu tree
 */
export function routesToMenuTree(routes: AppRouteRecordRaw[], basePath = ''): MenuItem[] {
  return routes
    .filter(route => !route.meta?.hidden)
    .map(route => {
      const fullPath = resolveRoutePath(route.path, basePath)
      const menu: MenuItem = {
        id: route.name as string || route.path,
        label: route.meta?.title || route.name as string,
        icon: route.meta?.icon,
        // Allow routes to render as external links in the sidebar menu.
        // Sidebar click handler will open these in a new browser tab.
        path: (route.meta as any)?.externalLink || fullPath,
        badge: route.meta?.badge,
        requiredPermissions: route.meta?.requiredPermissions,
        requiredRoles: route.meta?.requiredRoles,
        meta: route.meta
      }

      if (route.children && route.children.length > 0) {
        menu.children = routesToMenuTree(route.children, fullPath)
      }

      return menu
    })
    .sort((a, b) => {
      const orderA = a.meta?.order || 999
      const orderB = b.meta?.order || 999
      return orderA - orderB
    })
}

/**
 * Flatten routes for easier searching
 */
export function flattenRoutes(routes: AppRouteRecordRaw[]): AppRouteRecordRaw[] {
  let result: AppRouteRecordRaw[] = []

  routes.forEach(route => {
    result.push(route)
    if (route.children) {
      result = result.concat(flattenRoutes(route.children))
    }
  })

  return result
}

/**
 * Find route by path
 */
export function findRouteByPath(
  routes: AppRouteRecordRaw[],
  path: string
): AppRouteRecordRaw | undefined {
  const flatRoutes = flattenRoutes(routes)
  return flatRoutes.find(route => route.path === path)
}

/**
 * Find route by name
 */
export function findRouteByName(
  routes: AppRouteRecordRaw[],
  name: string
): AppRouteRecordRaw | undefined {
  const flatRoutes = flattenRoutes(routes)
  return flatRoutes.find(route => route.name === name)
}

/**
 * Convert backend route config to Vue Router route
 */
export function convertBackendRouteConfig(config: RouteConfig): AppRouteRecordRaw {
  const route: AppRouteRecordRaw = {
    path: config.path,
    name: config.name,
    component: () => import(`@/views/${config.component}.vue`),
    meta: config.meta
  }

  if (config.redirect) {
    route.redirect = config.redirect
  }

  if (config.children && config.children.length > 0) {
    route.children = config.children.map(child => convertBackendRouteConfig(child))
  }

  return route
}

/**
 * Get breadcrumb from route
 */
export function getBreadcrumbFromRoute(route: AppRouteRecordRaw): Array<{ label: string; path?: string }> {
  const breadcrumb: Array<{ label: string; path?: string }> = []

  const addBreadcrumb = (r: AppRouteRecordRaw) => {
    if (r.meta?.title) {
      breadcrumb.push({
        label: r.meta.title,
        path: r.path
      })
    }
  }

  // This is a simplified version
  // In real implementation, you'd traverse the route tree from root to current
  addBreadcrumb(route)

  return breadcrumb
}

/**
 * Check if route has permission
 */
export function hasRoutePermission(
  route: AppRouteRecordRaw,
  permissions: string[]
): boolean {
  if (permissions.includes('*')) {
    return true
  }

  if (!route.meta?.requiredPermissions) {
    return true
  }

  return route.meta.requiredPermissions.some(perm => permissions.includes(perm))
}

/**
 * Get all menu paths for search
 */
export function getAllMenuPaths(routes: AppRouteRecordRaw[]): Array<{
  path: string
  title: string
  icon?: string
}> {
  const result: Array<{ path: string; title: string; icon?: string }> = []

  const traverse = (routes: AppRouteRecordRaw[], basePath = '') => {
    routes.forEach(route => {
      const fullPath = resolveRoutePath(route.path, basePath)

      if (!route.meta?.hidden && route.meta?.title) {
        result.push({
          path: fullPath,
          title: route.meta.title,
          icon: route.meta.icon
        })
      }

      if (route.children) {
        traverse(route.children, fullPath)
      }
    })
  }

  traverse(routes)
  return result
}
