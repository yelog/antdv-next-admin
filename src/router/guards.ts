import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import { useTabsStore } from '@/stores/tabs'
import { isLoggedIn } from '@/utils/auth'
import { resolveLocaleText } from '@/utils/i18n'
import { basicRoutes } from './routes'

/**
 * Setup router guards
 */
export function setupRouterGuards(router: Router) {
  // Before each route navigation
  router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()
    const permissionStore = usePermissionStore()
    const tabsStore = useTabsStore()

    const generateDynamicRoutes = async () => {
      if (permissionStore.isRoutesGenerated) return

      if (!authStore.user) {
        authStore.initAuth()
      }

      const accessRoutes = await permissionStore.generateRoutes(
        authStore.userRoles,
        authStore.userPermissions
      )

      accessRoutes.forEach(route => {
        const routeName = route.name ? String(route.name) : ''
        if (routeName && router.hasRoute(routeName)) {
          return
        }
        router.addRoute(route)
      })
    }

    const initAffixTabsIfNeeded = () => {
      if (tabsStore.tabs.length > 0) return

      const routeSources = [
        ...basicRoutes,
        ...(permissionStore.routes as any[])
      ]
      tabsStore.initAffixTabs(routeSources)
    }

    // Set page title
    if (to.meta.title) {
      const title = resolveLocaleText(
        to.meta.title as string,
        String(to.name || to.path || 'Dashboard')
      )
      document.title = `${title} - ${import.meta.env.VITE_APP_TITLE || 'Antdv Next Admin'}`
    }

    // If first refresh hits catch-all and is redirected to 404,
    // restore dynamic routes first, then retry the original target.
    const redirectedFromPath = to.redirectedFrom?.fullPath
    const shouldRecoverFromNotFound = (
      to.path === '/404' &&
      !!redirectedFromPath &&
      redirectedFromPath !== '/404' &&
      isLoggedIn() &&
      !permissionStore.isRoutesGenerated
    )

    if (shouldRecoverFromNotFound) {
      try {
        await generateDynamicRoutes()
        initAffixTabsIfNeeded()
        next({ path: redirectedFromPath, replace: true })
        return
      } catch (error) {
        console.error('Failed to recover routes from not found redirect:', error)
        next('/403')
        return
      }
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

      // Generate dynamic routes if not already generated
      if (!permissionStore.isRoutesGenerated) {
        try {
          await generateDynamicRoutes()
          initAffixTabsIfNeeded()

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
      const requiredPermissions = to.meta.requiredPermissions as string[] | undefined
      if (requiredPermissions && Array.isArray(requiredPermissions) && requiredPermissions.length > 0) {
        const hasPermission = authStore.hasAnyPermission(requiredPermissions)
        if (!hasPermission) {
          next('/403')
          return
        }
      }

      // Check roles
      const requiredRoles = to.meta.requiredRoles as string[] | undefined
      if (requiredRoles && Array.isArray(requiredRoles) && requiredRoles.length > 0) {
        const hasRole = authStore.hasAnyRole(requiredRoles)
        if (!hasRole) {
          next('/403')
          return
        }
      }

      initAffixTabsIfNeeded()
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
