import type { Permission } from '@/types/auth'

export const mockPermissions: Permission[] = [
  // Dashboard
  {
    id: '1',
    name: 'View Dashboard',
    code: 'dashboard.view',
    description: 'Can view dashboard',
    resource: 'dashboard',
    action: 'view',
    type: 'menu'
  },

  // System - User Management
  {
    id: '10',
    name: 'User Management',
    code: 'system.user',
    description: 'User management menu',
    resource: 'system.user',
    action: '*',
    type: 'menu',
    children: [
      {
        id: '11',
        name: 'View Users',
        code: 'system.user.view',
        description: 'Can view user list',
        resource: 'system.user',
        action: 'view',
        type: 'api',
        parentId: '10'
      },
      {
        id: '12',
        name: 'Create User',
        code: 'system.user.create',
        description: 'Can create new user',
        resource: 'system.user',
        action: 'create',
        type: 'button',
        parentId: '10'
      },
      {
        id: '13',
        name: 'Edit User',
        code: 'system.user.edit',
        description: 'Can edit user information',
        resource: 'system.user',
        action: 'edit',
        type: 'button',
        parentId: '10'
      },
      {
        id: '14',
        name: 'Delete User',
        code: 'system.user.delete',
        description: 'Can delete user',
        resource: 'system.user',
        action: 'delete',
        type: 'button',
        parentId: '10'
      }
    ]
  },

  // System - Role Management
  {
    id: '20',
    name: 'Role Management',
    code: 'system.role',
    description: 'Role management menu',
    resource: 'system.role',
    action: '*',
    type: 'menu',
    children: [
      {
        id: '21',
        name: 'View Roles',
        code: 'system.role.view',
        description: 'Can view role list',
        resource: 'system.role',
        action: 'view',
        type: 'api',
        parentId: '20'
      },
      {
        id: '22',
        name: 'Create Role',
        code: 'system.role.create',
        description: 'Can create new role',
        resource: 'system.role',
        action: 'create',
        type: 'button',
        parentId: '20'
      },
      {
        id: '23',
        name: 'Edit Role',
        code: 'system.role.edit',
        description: 'Can edit role information',
        resource: 'system.role',
        action: 'edit',
        type: 'button',
        parentId: '20'
      },
      {
        id: '24',
        name: 'Delete Role',
        code: 'system.role.delete',
        description: 'Can delete role',
        resource: 'system.role',
        action: 'delete',
        type: 'button',
        parentId: '20'
      }
    ]
  },

  // System - Permission Management
  {
    id: '30',
    name: 'Permission Management',
    code: 'system.permission',
    description: 'Permission management menu',
    resource: 'system.permission',
    action: '*',
    type: 'menu',
    children: [
      {
        id: '31',
        name: 'View Permissions',
        code: 'system.permission.view',
        description: 'Can view permission list',
        resource: 'system.permission',
        action: 'view',
        type: 'api',
        parentId: '30'
      },
      {
        id: '32',
        name: 'Create Permission',
        code: 'system.permission.create',
        description: 'Can create new permission',
        resource: 'system.permission',
        action: 'create',
        type: 'button',
        parentId: '30'
      },
      {
        id: '33',
        name: 'Edit Permission',
        code: 'system.permission.edit',
        description: 'Can edit permission information',
        resource: 'system.permission',
        action: 'edit',
        type: 'button',
        parentId: '30'
      },
      {
        id: '34',
        name: 'Delete Permission',
        code: 'system.permission.delete',
        description: 'Can delete permission',
        resource: 'system.permission',
        action: 'delete',
        type: 'button',
        parentId: '30'
      }
    ]
  }
]
