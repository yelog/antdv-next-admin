import { createRouter, createWebHistory } from 'vue-router';

import { rebuildDynamicRoutes, resetRouter, setupRouterGuards } from './guards';
import { staticRoutes, basicRoutes, notFoundRoute } from './routes';

const routes = [...staticRoutes, ...basicRoutes, notFoundRoute];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes as unknown as readonly import('vue-router').RouteRecordRaw[],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

setupRouterGuards(router);

export { rebuildDynamicRoutes, resetRouter };

export default router;
