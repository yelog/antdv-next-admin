import type { AppRouteRecordRaw } from '@/types/router'

/**
 * Static routes that don't require authentication
 */
export const staticRoutes: AppRouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: 'login.title',
      requiresAuth: false,
      hidden: true,
    },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: 'error.404',
      requiresAuth: false,
      hidden: true,
    },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: 'error.403',
      requiresAuth: false,
      hidden: true,
    },
  },
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/views/error/500.vue'),
    meta: {
      title: 'error.500',
      requiresAuth: false,
      hidden: true,
    },
  },
]

/**
 * Demo routes for component showcase (embedded in documentation)
 */
export const demoRoutes: AppRouteRecordRaw[] = [
  {
    path: '/demo',
    name: 'Demo',
    component: () => import('@/views/demo/DemoLayout.vue'),
    meta: {
      title: 'Demo',
      requiresAuth: false,
      hidden: true,
    },
    children: [
      {
        path: 'pro-table',
        name: 'ProTableDemo',
        component: () => import('@/views/demo/pro-table/index.vue'),
        meta: {
          title: 'ProTable Demo',
          requiresAuth: false,
          hidden: true,
        },
      },
    ],
  },
]

/**
 * Catch-all route
 */
export const notFoundRoute: AppRouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'NotFoundCatchAll',
  redirect: '/404',
  meta: {
    title: 'Not Found',
    requiresAuth: false,
    hidden: true,
  },
}
