import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import { useTabsStore } from '@/stores/tabs'
import { isLoggedIn } from '@/utils/auth'

/**
 * Setup router guards
 */
export function setupRouterGuards(router: Router) {
  // Before each route navigation
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const permissionStore = usePermissionStore()
    const tabsStore = useTabsStore()

    // Set page title
    if (to.meta.title) {
      document.title = `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE || 'Antdv Next Admin'}`
    }

    // Check if route requires authentication
    const requiresAuth = to.meta.requiresAuth !== false

    if (requiresAuth) {
      // Check if user is logged in
      if (!isLoggedIn()) {
        // Redirect to login page
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }

      // Initialize auth data if not already loaded
      if (!authStore.user) {
        try {
          authStore.initAuth()
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          next('/login')
          return
        }
      }

      // Generate dynamic routes if not already generated
      if (!permissionStore.isRoutesGenerated) {
        try {
          const accessRoutes = await permissionStore.generateRoutes(
            authStore.userRoles,
            authStore.userPermissions
          )

          // Add routes dynamically
          accessRoutes.forEach(route => {
            router.addRoute(route)
          })

          // Continue to the target route
          next({ ...to, replace: true })
          return
        } catch (error) {
          console.error('Failed to generate routes:', error)
          next('/403')
          return
        }
      }

      // Check permissions
      const requiredPermissions = to.meta.requiredPermissions
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasPermission = authStore.hasAnyPermission(requiredPermissions)
        if (!hasPermission) {
          next('/403')
          return
        }
      }

      // Check roles
      const requiredRoles = to.meta.requiredRoles
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRole = authStore.hasAnyRole(requiredRoles)
        if (!hasRole) {
          next('/403')
          return
        }
      }
    }

    // Add to tabs
    if (to.name && to.meta.requiresAuth !== false && !to.meta.hidden) {
      tabsStore.addTab(to)
    }

    next()
  })

  // After each route navigation
  router.afterEach((to) => {
    // Scroll to top
    window.scrollTo(0, 0)

    // Set active tab
    const tabsStore = useTabsStore()
    if (to.path) {
      tabsStore.setActiveTab(to.path)
    }
  })

  // On error
  router.onError((error) => {
    console.error('Router error:', error)
  })
}
