import { createRouter, createWebHistory } from 'vue-router'
import { staticRoutes, basicRoutes, notFoundRoute, demoRoutes } from './routes'
import { setupRouterGuards } from './guards'

// Combine static and basic routes
// Combine static, demo and basic routes
const routes = [
  ...staticRoutes,
  ...demoRoutes,
  ...basicRoutes
]

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
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
router.addRoute(notFoundRoute as any)

export default router
