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
      hidden: true
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: 'error.404',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: 'error.403',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/views/error/500.vue'),
    meta: {
      title: 'error.500',
      requiresAuth: false,
      hidden: true
    }
  }
]

/**
 * Basic routes that require authentication
 */
export const basicRoutes: AppRouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    redirect: '/dashboard',
    component: () => import('@/components/Layout/AdminLayout.vue'),
    meta: {
      title: 'Dashboard',
      requiresAuth: true
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: 'menu.dashboard',
          icon: 'DashboardOutlined',
          requiresAuth: true,
          affix: true,
          order: 1
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: {
          title: 'menu.profile',
          icon: 'UserOutlined',
          requiresAuth: true,
          hidden: true
        }
      }
    ]
  }
]

/**
 * Async routes that require permission checking
 */
export const asyncRoutes: AppRouteRecordRaw[] = [
  {
    path: '/system',
    name: 'System',
    redirect: '/system/user',
    component: () => import('@/components/Layout/AdminLayout.vue'),
    meta: {
      title: 'menu.system',
      icon: 'SettingOutlined',
      requiresAuth: true,
      order: 2
    },
    children: [
      {
        path: 'user',
        name: 'SystemUser',
        component: () => import('@/views/system/user/index.vue'),
        meta: {
          title: 'menu.user',
          icon: 'UserOutlined',
          requiresAuth: true,
          requiredPermissions: ['system.user.view']
        }
      },
      {
        path: 'role',
        name: 'SystemRole',
        component: () => import('@/views/system/role/index.vue'),
        meta: {
          title: 'menu.role',
          icon: 'TeamOutlined',
          requiresAuth: true,
          requiredPermissions: ['system.role.view']
        }
      },
      {
        path: 'permission',
        name: 'SystemPermission',
        component: () => import('@/views/system/permission/index.vue'),
        meta: {
          title: 'menu.permission',
          icon: 'SafetyOutlined',
          requiresAuth: true,
          requiredPermissions: ['system.permission.view']
        }
      }
    ]
  },
  {
    path: '/examples',
    name: 'Examples',
    redirect: '/examples/table',
    component: () => import('@/components/Layout/AdminLayout.vue'),
    meta: {
      title: 'menu.examples',
      icon: 'AppstoreOutlined',
      requiresAuth: true,
      order: 3
    },
    children: [
      {
        path: 'table',
        name: 'ExamplesTable',
        component: () => import('@/views/examples/table/index.vue'),
        meta: {
          title: 'menu.table',
          icon: 'TableOutlined',
          requiresAuth: true
        }
      },
      {
        path: 'form',
        name: 'ExamplesForm',
        component: () => import('@/views/examples/form/index.vue'),
        meta: {
          title: 'menu.form',
          icon: 'FormOutlined',
          requiresAuth: true
        }
      },
      {
        path: 'watermark',
        name: 'ExamplesWatermark',
        component: () => import('@/views/examples/watermark/index.vue'),
        meta: {
          title: 'menu.watermark',
          icon: 'HighlightOutlined',
          requiresAuth: true
        }
      }
    ]
  }
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
    hidden: true
  }
}
