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
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/redirect/index.vue'),
        meta: {
          hidden: true
        }
      },
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
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/notification/index.vue'),
        meta: {
          title: 'layout.notifications',
          icon: 'BellOutlined',
          requiresAuth: true,
          hidden: true
        }
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/about/index.vue'),
        meta: {
          title: 'menu.about',
          icon: 'InfoCircleOutlined',
          requiresAuth: true,
          order: 5
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
    path: '/organization',
    name: 'Organization',
    redirect: '/organization/dept',
    component: () => import('@/components/Layout/AdminLayout.vue'),
    meta: {
      title: 'menu.organization',
      icon: 'TeamOutlined',
      requiresAuth: true,
      order: 3
    },
    children: [
      {
        path: 'dept',
        name: 'OrganizationDept',
        component: () => import('@/views/system/dept/index.vue'),
        meta: {
          title: 'menu.dept',
          icon: 'ApartmentOutlined',
          requiresAuth: true,
          requiredPermissions: ['system.dept.view']
        }
      },
      {
        path: 'user',
        name: 'OrganizationUser',
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
        name: 'OrganizationRole',
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
        name: 'OrganizationPermission',
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
    path: '/system',
    name: 'System',
    redirect: '/system/config',
    component: () => import('@/components/Layout/AdminLayout.vue'),
    meta: {
      title: 'menu.system',
      icon: 'SettingOutlined',
      requiresAuth: true,
      order: 4
    },
    children: [
      {
        path: 'config',
        name: 'SystemConfig',
        component: () => import('@/views/system/config/index.vue'),
        meta: {
          title: 'menu.config',
          icon: 'ControlOutlined',
          requiresAuth: true,
          requiredPermissions: ['system.config.view']
        }
      },
      {
        path: 'dict',
        name: 'SystemDict',
        component: () => import('@/views/system/dict/index.vue'),
        meta: {
          title: 'menu.dict',
          icon: 'BookOutlined',
          requiresAuth: true,
          requiredPermissions: ['system.dict.view']
        }
      },
      {
        path: 'file',
        name: 'SystemFile',
        component: () => import('@/views/system/file/index.vue'),
        meta: {
          title: 'menu.file',
          icon: 'FolderOutlined',
          requiresAuth: true,
          requiredPermissions: ['system.file.view']
        }
      },
      {
        path: 'log',
        name: 'SystemLog',
        component: () => import('@/views/system/log/index.vue'),
        meta: {
          title: 'menu.log',
          icon: 'FileTextOutlined',
          requiresAuth: true,
          requiredPermissions: ['system.log.view']
        }
      }
    ]
  },
  {
    path: '/examples',
    name: 'Examples',
    redirect: '/examples/pro-table-advanced',
    component: () => import('@/components/Layout/AdminLayout.vue'),
    meta: {
      title: 'menu.examples',
      icon: 'AppstoreOutlined',
      requiresAuth: true,
      order: 2
    },
    children: [
      {
        path: 'quick-start',
        name: 'ExamplesQuickStartGroup',
        redirect: '/examples/pro-table-advanced',
        component: () => import('@/components/RouteView.vue'),
        meta: {
          title: 'menu.examplesQuickStart',
          icon: 'ThunderboltOutlined',
          requiresAuth: true,
          order: 1
        },
        children: [
          {
            path: '/examples/pro-table-advanced',
            name: 'ExamplesProTableAdvanced',
            component: () => import('@/views/examples/scaffold/pro-table-advanced/index.vue'),
            meta: {
              title: 'menu.proTableAdvanced',
              icon: 'TableOutlined',
              requiresAuth: true,
              order: 1
            }
          },
          {
            path: '/examples/complex-form',
            name: 'ExamplesComplexForm',
            component: () => import('@/views/examples/scaffold/complex-form/index.vue'),
            meta: {
              title: 'menu.complexForm',
              icon: 'FormOutlined',
              requiresAuth: true,
              order: 2
            }
          },
          {
            path: '/examples/master-detail',
            name: 'ExamplesMasterDetail',
            component: () => import('@/views/examples/scaffold/master-detail/index.vue'),
            meta: {
              title: 'menu.masterDetail',
              icon: 'ProfileOutlined',
              requiresAuth: true,
              order: 3
            }
          },
          {
            path: '/examples/virtual-table',
            name: 'ExamplesVirtualTable',
            component: () => import('@/views/examples/scaffold/virtual-table/index.vue'),
            meta: {
              title: 'menu.virtualTable',
              icon: 'TableOutlined',
              requiresAuth: true,
              order: 4
            }
          }
        ]
      },
      {
        path: 'form-input',
        name: 'ExamplesFormInputGroup',
        redirect: '/examples/form',
        component: () => import('@/components/RouteView.vue'),
        meta: {
          title: 'menu.examplesFormInput',
          icon: 'FormOutlined',
          requiresAuth: true,
          order: 2
        },
        children: [
          {
            path: '/examples/form',
            name: 'ExamplesForm',
            component: () => import('@/views/examples/form/index.vue'),
            meta: {
              title: 'menu.form',
              icon: 'FormOutlined',
              requiresAuth: true,
              order: 1
            }
          },
          {
            path: '/examples/json-input',
            name: 'ExamplesJsonInput',
            component: () => import('@/views/examples/json-input/index.vue'),
            meta: {
              title: 'menu.jsonInput',
              icon: 'CodeOutlined',
              requiresAuth: true,
              order: 2
            }
          },
          {
            path: '/examples/i18n-input',
            name: 'ExamplesI18nInput',
            component: () => import('@/views/examples/i18n-input/index.vue'),
            meta: {
              title: 'menu.i18nInput',
              icon: 'GlobalOutlined',
              requiresAuth: true,
              order: 3
            }
          },
          {
            path: '/examples/advanced-filter',
            name: 'ExamplesAdvancedFilter',
            component: () => import('@/views/examples/scaffold/advanced-filter/index.vue'),
            meta: {
              title: 'menu.advancedFilter',
              icon: 'ControlOutlined',
              requiresAuth: true,
              order: 4
            }
          }
        ]
      },
      {
        path: 'content-editors',
        name: 'ExamplesContentGroup',
        redirect: '/examples/editor',
        component: () => import('@/components/RouteView.vue'),
        meta: {
          title: 'menu.examplesContent',
          icon: 'EditOutlined',
          requiresAuth: true,
          order: 3
        },
        children: [
          {
            path: '/examples/editor',
            name: 'ExamplesEditor',
            component: () => import('@/views/examples/editor/index.vue'),
            meta: {
              title: 'menu.editor',
              icon: 'EditOutlined',
              requiresAuth: true,
              order: 1
            }
          },
          {
            path: '/examples/milkdown',
            name: 'ExamplesMilkdown',
            component: () => import('@/views/examples/milkdown/index.vue'),
            meta: {
              title: 'menu.milkdown',
              icon: 'FileMarkdownOutlined',
              requiresAuth: true,
              order: 2
            }
          }
        ]
      },
      {
        path: 'basic-interaction',
        name: 'ExamplesInteractionGroup',
        redirect: '/examples/table',
        component: () => import('@/components/RouteView.vue'),
        meta: {
          title: 'menu.examplesInteraction',
          icon: 'AppstoreAddOutlined',
          requiresAuth: true,
          order: 4
        },
        children: [
          {
            path: '/examples/table',
            name: 'ExamplesTable',
            component: () => import('@/views/examples/table/index.vue'),
            meta: {
              title: 'menu.table',
              icon: 'TableOutlined',
              requiresAuth: true,
              order: 1
            }
          },
          {
            path: '/examples/modal',
            name: 'ExamplesModal',
            component: () => import('@/views/examples/modal/index.vue'),
            meta: {
              title: 'menu.modal',
              icon: 'ExpandOutlined',
              requiresAuth: true,
              order: 2
            }
          },
          {
            path: '/examples/icon',
            name: 'ExamplesIcon',
            component: () => import('@/views/examples/icon/index.vue'),
            meta: {
              title: 'menu.icon',
              icon: 'SmileOutlined',
              requiresAuth: true,
              order: 3
            }
          },
          {
            path: '/examples/spin',
            name: 'ExamplesSpin',
            component: () => import('@/views/examples/spin/index.vue'),
            meta: {
              title: 'menu.spin',
              icon: 'LoadingOutlined',
              requiresAuth: true,
              order: 4
            }
          },
          {
            path: '/examples/captcha',
            name: 'ExamplesCaptcha',
            component: () => import('@/views/examples/captcha/index.vue'),
            meta: {
              title: 'menu.captcha',
              icon: 'SafetyCertificateOutlined',
              requiresAuth: true,
              order: 5
            }
          },
          {
            path: '/examples/watermark',
            name: 'ExamplesWatermark',
            component: () => import('@/views/examples/watermark/index.vue'),
            meta: {
              title: 'menu.watermark',
              icon: 'HighlightOutlined',
              requiresAuth: true,
              order: 6
            }
          }
        ]
      },
      {
        path: 'business-scaffold',
        name: 'ExamplesBusinessScaffoldGroup',
        redirect: '/examples/upload-system',
        component: () => import('@/components/RouteView.vue'),
        meta: {
          title: 'menu.examplesBusinessScaffold',
          icon: 'ProfileOutlined',
          requiresAuth: true,
          order: 5
        },
        children: [
          {
            path: '/examples/upload-system',
            name: 'ExamplesUploadSystem',
            component: () => import('@/views/examples/scaffold/upload-system/index.vue'),
            meta: {
              title: 'menu.uploadSystem',
              icon: 'CloudUploadOutlined',
              requiresAuth: true,
              order: 1
            }
          },
          {
            path: '/examples/state-cache',
            name: 'ExamplesStateCache',
            component: () => import('@/views/examples/scaffold/state-cache/index.vue'),
            meta: {
              title: 'menu.stateCache',
              icon: 'DatabaseOutlined',
              requiresAuth: true,
              order: 2
            }
          }
        ]
      },
      {
        path: 'security-engineering',
        name: 'ExamplesSecurityEngineeringGroup',
        redirect: '/examples/request-auth',
        component: () => import('@/components/RouteView.vue'),
        meta: {
          title: 'menu.examplesSecurityEngineering',
          icon: 'SafetyOutlined',
          requiresAuth: true,
          order: 6
        },
        children: [
          {
            path: '/examples/request-auth',
            name: 'ExamplesRequestAuth',
            component: () => import('@/views/examples/scaffold/request-auth/index.vue'),
            meta: {
              title: 'menu.requestAuth',
              icon: 'SafetyOutlined',
              requiresAuth: true,
              order: 1
            }
          },
          {
            path: '/examples/rbac-flow',
            name: 'ExamplesRbacFlow',
            component: () => import('@/views/examples/scaffold/rbac/index.vue'),
            meta: {
              title: 'menu.rbacFlow',
              icon: 'SafetyCertificateOutlined',
              requiresAuth: true,
              order: 2
            }
          },
          {
            path: '/examples/observability',
            name: 'ExamplesObservability',
            component: () => import('@/views/examples/scaffold/observability/index.vue'),
            meta: {
              title: 'menu.observability',
              icon: 'LineChartOutlined',
              requiresAuth: true,
              order: 3
            }
          },
          {
            path: '/examples/testing',
            name: 'ExamplesTesting',
            component: () => import('@/views/examples/scaffold/testing/index.vue'),
            meta: {
              title: 'menu.testing',
              icon: 'CheckCircleOutlined',
              requiresAuth: true,
              order: 4
            }
          }
        ]
      },
      {
        path: 'integration-navigation',
        name: 'ExamplesIntegrationGroup',
        redirect: '/examples/external/iframe/typescript',
        component: () => import('@/components/RouteView.vue'),
        meta: {
          title: 'menu.examplesIntegration',
          icon: 'LinkOutlined',
          requiresAuth: true,
          order: 7
        },
        children: [
          {
            path: '/examples/external',
            name: 'ExamplesExternal',
            redirect: '/examples/external/iframe/typescript',
            component: () => import('@/components/RouteView.vue'),
            meta: {
              title: 'menu.external',
              icon: 'LinkOutlined',
              requiresAuth: true,
              order: 1
            },
            children: [
              {
                path: 'iframe',
                name: 'ExamplesExternalIframe',
                redirect: '/examples/external/iframe/typescript',
                component: () => import('@/components/RouteView.vue'),
                meta: {
                  title: 'menu.externalIframe',
                  icon: 'AppstoreAddOutlined',
                  requiresAuth: true,
                  order: 1
                },
                children: [
                  {
                    path: 'typescript',
                    name: 'ExamplesExternalIframeTypescript',
                    component: () => import('@/views/examples/external/iframe/typescript.vue'),
                    meta: {
                      title: 'menu.externalTypescript',
                      icon: 'CodeOutlined',
                      requiresAuth: true,
                      order: 1
                    }
                  },
                  {
                    path: 'antdv-next',
                    name: 'ExamplesExternalIframeAntdvNext',
                    component: () => import('@/views/examples/external/iframe/antdv-next.vue'),
                    meta: {
                      title: 'menu.externalAntdvNext',
                      icon: 'AntDesignOutlined',
                      requiresAuth: true,
                      order: 2
                    }
                  }
                ]
              },
              {
                path: 'link',
                name: 'ExamplesExternalLink',
                component: () => import('@/components/RouteView.vue'),
                meta: {
                  title: 'menu.externalLink',
                  icon: 'LinkOutlined',
                  requiresAuth: true,
                  order: 2
                },
                children: [
                  {
                    path: 'vite',
                    name: 'ExamplesExternalLinkVite',
                    component: () => import('@/views/examples/external/link/vite.vue'),
                    meta: {
                      title: 'menu.externalVite',
                      icon: 'ThunderboltOutlined',
                      requiresAuth: true,
                      externalLink: 'https://vite.dev',
                      order: 1
                    }
                  },
                  {
                    path: 'vue',
                    name: 'ExamplesExternalLinkVue',
                    component: () => import('@/views/examples/external/link/vue.vue'),
                    meta: {
                      title: 'menu.externalVue',
                      icon: 'CoffeeOutlined',
                      requiresAuth: true,
                      externalLink: 'https://vuejs.org',
                      order: 2
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        path: 'exception-pages',
        name: 'ExamplesExceptionGroup',
        redirect: '/examples/exception/403',
        component: () => import('@/components/RouteView.vue'),
        meta: {
          title: 'menu.examplesExceptionPages',
          icon: 'WarningOutlined',
          requiresAuth: true,
          order: 8
        },
        children: [
          {
            path: '/examples/exception',
            name: 'ExamplesException',
            redirect: '/examples/exception/403',
            component: () => import('@/components/RouteView.vue'),
            meta: {
              title: 'menu.exception',
              icon: 'WarningOutlined',
              requiresAuth: true,
              order: 1
            },
            children: [
              {
                path: '403',
                name: 'ExamplesException403',
                component: () => import('@/views/examples/exception/403.vue'),
                meta: {
                  title: 'menu.exception403',
                  icon: 'StopOutlined',
                  requiresAuth: true,
                  order: 1
                }
              },
              {
                path: '404',
                name: 'ExamplesException404',
                component: () => import('@/views/examples/exception/404.vue'),
                meta: {
                  title: 'menu.exception404',
                  icon: 'FileUnknownOutlined',
                  requiresAuth: true,
                  order: 2
                }
              },
              {
                path: '500',
                name: 'ExamplesException500',
                component: () => import('@/views/examples/exception/500.vue'),
                meta: {
                  title: 'menu.exception500',
                  icon: 'BugOutlined',
                  requiresAuth: true,
                  order: 3
                }
              }
            ]
          }
        ]
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
