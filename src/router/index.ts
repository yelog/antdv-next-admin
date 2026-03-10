import { createRouter, createWebHistory } from "vue-router";

import { setupRouterGuards } from "./guards";
import { staticRoutes, basicRoutes, notFoundRoute } from "./routes";

// Combine static and basic routes
const routes = [...staticRoutes, ...basicRoutes];

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes as unknown as readonly import("vue-router").RouteRecordRaw[],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Setup router guards
setupRouterGuards(router);

// Add not found route last (after dynamic routes are added)
router.addRoute(
  notFoundRoute as unknown as import("vue-router").RouteRecordRaw,
);

export default router;
