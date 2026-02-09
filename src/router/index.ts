import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { staticRoutes, basicRoutes, notFoundRoute } from './routes'
import { setupRouterGuards } from './guards'

// Combine static and basic routes
const routes: RouteRecordRaw[] = [
  ...staticRoutes,
  ...basicRoutes
]

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Setup router guards
setupRouterGuards(router)

// Add not found route last (after dynamic routes are added)
router.addRoute(notFoundRoute)

export default router
