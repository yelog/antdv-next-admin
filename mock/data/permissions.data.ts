import type { Permission } from '@/types/auth'

export const mockPermissions: Permission[] = [
  // Dashboard Menu
  {
    id: '1',
    name: 'Dashboard',
    code: 'dashboard.view',
    description: 'Dashboard menu',
    resource: '/dashboard',
    action: 'view',
    type: 'menu',
    path: '/dashboard',
    component: 'dashboard/index',
    icon: 'DashboardOutlined',
    sort: 1,
    status: 'active',
    visible: true
  },

  // System Menu
  {
    id: '10',
    name: 'System Management',
    code: 'system.menu',
    description: 'System management root menu',
    resource: '/system',
    action: '*',
    type: 'menu',
    path: '/system',
    component: 'Layout',
    icon: 'SettingOutlined',
    sort: 2,
    status: 'active',
    visible: true,
    children: [
      {
        id: '11',
        name: 'User Management',
        code: 'system.user.view',
        description: 'User management menu',
        resource: '/system/user',
        action: 'view',
        type: 'menu',
        parentId: '10',
        path: '/system/user',
        component: 'system/user/index',
        icon: 'UserOutlined',
        sort: 1,
        status: 'active',
        visible: true,
        children: [
          {
            id: '12',
            name: 'Create User',
            code: 'system.user.create',
            description: 'Can create users',
            resource: 'system.user',
            action: 'create',
            type: 'button',
            parentId: '11',
            status: 'active',
            visible: true
          },
          {
            id: '13',
            name: 'Edit User',
            code: 'system.user.edit',
            description: 'Can edit users',
            resource: 'system.user',
            action: 'edit',
            type: 'button',
            parentId: '11',
            status: 'active',
            visible: true
          },
          {
            id: '14',
            name: 'Delete User',
            code: 'system.user.delete',
            description: 'Can delete users',
            resource: 'system.user',
            action: 'delete',
            type: 'button',
            parentId: '11',
            status: 'active',
            visible: true
          }
        ]
      },
      {
        id: '20',
        name: 'Role Management',
        code: 'system.role.view',
        description: 'Role management menu',
        resource: '/system/role',
        action: 'view',
        type: 'menu',
        parentId: '10',
        path: '/system/role',
        component: 'system/role/index',
        icon: 'TeamOutlined',
        sort: 2,
        status: 'active',
        visible: true,
        children: [
          {
            id: '21',
            name: 'Create Role',
            code: 'system.role.create',
            description: 'Can create roles',
            resource: 'system.role',
            action: 'create',
            type: 'button',
            parentId: '20',
            status: 'active',
            visible: true
          },
          {
            id: '22',
            name: 'Edit Role',
            code: 'system.role.edit',
            description: 'Can edit roles',
            resource: 'system.role',
            action: 'edit',
            type: 'button',
            parentId: '20',
            status: 'active',
            visible: true
          },
          {
            id: '23',
            name: 'Delete Role',
            code: 'system.role.delete',
            description: 'Can delete roles',
            resource: 'system.role',
            action: 'delete',
            type: 'button',
            parentId: '20',
            status: 'active',
            visible: true
          }
        ]
      },
      {
        id: '30',
        name: 'Menu Management',
        code: 'system.permission.view',
        description: 'Menu management menu',
        resource: '/system/permission',
        action: 'view',
        type: 'menu',
        parentId: '10',
        path: '/system/permission',
        component: 'system/permission/index',
        icon: 'SafetyOutlined',
        sort: 3,
        status: 'active',
        visible: true,
        children: [
          {
            id: '31',
            name: 'Create Menu',
            code: 'system.permission.create',
            description: 'Can create menu',
            resource: 'system.permission',
            action: 'create',
            type: 'button',
            parentId: '30',
            status: 'active',
            visible: true
          },
          {
            id: '32',
            name: 'Edit Menu',
            code: 'system.permission.edit',
            description: 'Can edit menu',
            resource: 'system.permission',
            action: 'edit',
            type: 'button',
            parentId: '30',
            status: 'active',
            visible: true
          },
          {
            id: '33',
            name: 'Delete Menu',
            code: 'system.permission.delete',
            description: 'Can delete menu',
            resource: 'system.permission',
            action: 'delete',
            type: 'button',
            parentId: '30',
            status: 'active',
            visible: true
          }
        ]
      }
    ]
  }
]
