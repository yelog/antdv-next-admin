import { defineMock } from 'vite-plugin-mock-dev-server'
import { mockPermissions } from '../data/permissions.data'
import { faker } from '@faker-js/faker'
import type { Permission } from '@/types/auth'

const permissionStore: Permission[] = JSON.parse(JSON.stringify(mockPermissions))

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

function findPermissionById(
  permissions: Permission[],
  id: string,
  parent: Permission | null = null
): { permission: Permission | null; parent: Permission | null } {
  for (const permission of permissions) {
    if (permission.id === id) {
      return { permission, parent }
    }

    if (permission.children && permission.children.length > 0) {
      const result = findPermissionById(permission.children, id, permission)
      if (result.permission) {
        return result
      }
    }
  }

  return { permission: null, parent: null }
}

function removePermissionById(permissions: Permission[], id: string): boolean {
  const index = permissions.findIndex(permission => permission.id === id)
  if (index !== -1) {
    permissions.splice(index, 1)
    return true
  }

  return permissions.some(permission => {
    if (!permission.children || permission.children.length === 0) {
      return false
    }

    const removed = removePermissionById(permission.children, id)
    if (removed && permission.children.length === 0) {
      delete permission.children
    }
    return removed
  })
}

function appendPermission(permissions: Permission[], permission: Permission, parentId?: string): boolean {
  if (!parentId) {
    permissions.push(permission)
    return true
  }

  const { permission: parentPermission } = findPermissionById(permissions, parentId)
  if (!parentPermission) {
    return false
  }

  if (!parentPermission.children) {
    parentPermission.children = []
  }
  parentPermission.children.push(permission)
  return true
}

function filterPermissionTree(
  permissions: Permission[],
  keyword?: string,
  type?: string,
  status?: string
): Permission[] {
  const normalizedKeyword = keyword?.toLowerCase().trim()

  return permissions.reduce<Permission[]>((result, permission) => {
    const children = permission.children
      ? filterPermissionTree(permission.children, keyword, type, status)
      : []

    const matchedKeyword = !normalizedKeyword ||
      permission.name.toLowerCase().includes(normalizedKeyword) ||
      permission.code.toLowerCase().includes(normalizedKeyword) ||
      (permission.path || '').toLowerCase().includes(normalizedKeyword)

    const matchedType = !type || permission.type === type
    const matchedStatus = !status || (permission.status || 'active') === status
    const matchedSelf = matchedKeyword && matchedType && matchedStatus

    if (matchedSelf || children.length > 0) {
      result.push({
        ...permission,
        children: children.length > 0 ? children : undefined
      })
    }

    return result
  })
}

export default defineMock([
  // Get permission list (tree structure)
  {
    url: '/api/permissions',
    method: 'GET',
    body: (req) => {
      const { keyword, type, status } = req.query
      const filtered = filterPermissionTree(permissionStore, keyword, type, status)

      return {
        code: 200,
        message: 'Success',
        data: deepClone(filtered),
        success: true
      }
    }
  },

  // Get permission tree (for menu)
  {
    url: '/api/permissions/tree',
    method: 'GET',
    body: () => {
      return {
        code: 200,
        message: 'Success',
        data: deepClone(permissionStore),
        success: true
      }
    }
  },

  // Get permission by ID
  {
    url: '/api/permissions/:id',
    method: 'GET',
    body: (req) => {
      const { id } = req.params
      const { permission } = findPermissionById(permissionStore, id)

      if (!permission) {
        return {
          code: 404,
          message: 'Permission not found',
          data: null,
          success: false
        }
      }

      return {
        code: 200,
        message: 'Success',
        data: deepClone(permission),
        success: true
      }
    }
  },

  // Create permission
  {
    url: '/api/permissions',
    method: 'POST',
    body: (req) => {
      const payload = req.body || {}
      const permission: Permission = {
        id: faker.string.uuid(),
        name: payload.name,
        code: payload.code,
        description: payload.description || '',
        resource: payload.resource || payload.path || payload.code,
        action: payload.action || (payload.type === 'menu' ? 'view' : '*'),
        type: payload.type || 'menu',
        parentId: payload.parentId,
        path: payload.path,
        component: payload.component,
        icon: payload.icon,
        sort: payload.sort ?? 0,
        status: payload.status || 'active',
        visible: payload.visible ?? true,
        children: payload.children && payload.children.length > 0 ? payload.children : undefined
      }

      const appended = appendPermission(permissionStore, permission, payload.parentId)
      if (!appended) {
        return {
          code: 400,
          message: 'Parent permission not found',
          data: null,
          success: false
        }
      }

      return {
        code: 200,
        message: 'Permission created successfully',
        data: deepClone(permission),
        success: true
      }
    }
  },

  // Update permission
  {
    url: '/api/permissions/:id',
    method: 'PUT',
    body: (req) => {
      const { id } = req.params
      const payload = req.body || {}
      const { permission, parent } = findPermissionById(permissionStore, id)

      if (!permission) {
        return {
          code: 404,
          message: 'Permission not found',
          data: null,
          success: false
        }
      }

      if (
        payload.parentId !== undefined &&
        payload.parentId !== permission.parentId
      ) {
        const movedPermission = deepClone(permission)
        removePermissionById(permissionStore, id)
        movedPermission.parentId = payload.parentId
        movedPermission.children = permission.children || []
        const appended = appendPermission(permissionStore, movedPermission, payload.parentId)
        if (!appended) {
          appendPermission(permissionStore, movedPermission, parent?.id)
          return {
            code: 400,
            message: 'Parent permission not found',
            data: null,
            success: false
          }
        }
      }

      const { permission: nextPermission } = findPermissionById(permissionStore, id)
      if (!nextPermission) {
        return {
          code: 404,
          message: 'Permission not found',
          data: null,
          success: false
        }
      }

      const children = nextPermission.children
      Object.assign(nextPermission, payload, { children })

      return {
        code: 200,
        message: 'Permission updated successfully',
        data: deepClone(nextPermission),
        success: true
      }
    }
  },

  // Delete permission
  {
    url: '/api/permissions/:id',
    method: 'DELETE',
    body: (req) => {
      const { id } = req.params
      const removed = removePermissionById(permissionStore, id)

      if (!removed) {
        return {
          code: 404,
          message: 'Permission not found',
          data: null,
          success: false
        }
      }

      return {
        code: 200,
        message: 'Permission deleted successfully',
        data: null,
        success: true
      }
    }
  },

  // Get user permissions
  {
    url: '/api/permissions/user',
    method: 'GET',
    body: (req) => {
      // In a real app, this would be based on the user's roles
      // For now, return all permissions for admin
      const token = req.headers.authorization?.replace('Bearer ', '')
      const userId = token?.split('-')[2]

      if (userId === '1') {
        // Admin - all permissions
        return {
          code: 200,
          message: 'Success',
          data: deepClone(permissionStore),
          success: true
        }
      } else {
        // Regular user - limited permissions
        return {
          code: 200,
          message: 'Success',
          data: deepClone(permissionStore.filter(permission => permission.code === 'dashboard.view')),
          success: true
        }
      }
    }
  }
])
