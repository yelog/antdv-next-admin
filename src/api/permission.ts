import { request } from '@/utils/request'
import type { Permission } from '@/types/auth'
import type { ApiResponse } from '@/types/api'

const isMock = import.meta.env.VITE_USE_MOCK === 'true'

const ok = <T>(data: T, message = 'Success'): ApiResponse<T> => ({
  code: 200,
  message,
  data,
  success: true
})

const notFound = (message = 'Not found'): ApiResponse<any> => ({
  code: 404,
  message,
  data: null,
  success: false
})

/**
 * Get permission list
 */
export async function getPermissionList(params?: Record<string, any>): Promise<ApiResponse<Permission[]>> {
  if (!isMock) return request.get('/permissions', { params })

  const { mockPermissions } = await import('../../mock/data/permissions.data')
  return ok(mockPermissions)
}

/**
 * Get permission tree
 */
export async function getPermissionTree(): Promise<ApiResponse<Permission[]>> {
  if (!isMock) return request.get('/permissions/tree')

  const { mockPermissions } = await import('../../mock/data/permissions.data')
  return ok(mockPermissions)
}

/**
 * Get permission by ID
 */
export async function getPermissionById(id: string): Promise<ApiResponse<Permission>> {
  if (!isMock) return request.get(`/permissions/${id}`)

  const { mockPermissions } = await import('../../mock/data/permissions.data')

  const find = (list: Permission[]): Permission | undefined => {
    for (const p of list) {
      if (p.id === id) return p
      if (p.children?.length) {
        const hit = find(p.children as Permission[])
        if (hit) return hit
      }
    }
    return undefined
  }

  const perm = find(mockPermissions)
  if (!perm) return notFound('Permission not found')
  return ok(perm)
}

/**
 * Create permission
 */
export async function createPermission(data: Partial<Permission>): Promise<ApiResponse<Permission>> {
  if (!isMock) return request.post('/permissions', data)

  const { mockPermissions } = await import('../../mock/data/permissions.data')
  const nowId = String(Date.now())
  const perm: Permission = {
    id: nowId,
    name: data.name || 'New Permission',
    code: data.code || `perm_${nowId}`,
    description: data.description || '',
    resource: data.resource || '',
    action: data.action || 'view',
    type: (data.type as any) || 'api'
  }

  mockPermissions.unshift(perm)
  return ok(perm, 'Permission created successfully')
}

/**
 * Update permission
 */
export async function updatePermission(id: string, data: Partial<Permission>): Promise<ApiResponse<Permission>> {
  if (!isMock) return request.put(`/permissions/${id}`, data)

  const { mockPermissions } = await import('../../mock/data/permissions.data')

  const updateRec = (list: Permission[]): Permission | undefined => {
    for (let i = 0; i < list.length; i++) {
      const p = list[i]
      if (p.id === id) {
        list[i] = { ...p, ...data } as Permission
        return list[i]
      }
      if (p.children?.length) {
        const hit = updateRec(p.children as Permission[])
        if (hit) return hit
      }
    }
    return undefined
  }

  const updated = updateRec(mockPermissions)
  if (!updated) return notFound('Permission not found')
  return ok(updated, 'Permission updated successfully')
}

/**
 * Delete permission
 */
export async function deletePermission(id: string): Promise<ApiResponse<null>> {
  if (!isMock) return request.delete(`/permissions/${id}`)

  const { mockPermissions } = await import('../../mock/data/permissions.data')

  const deleteRec = (list: Permission[]): boolean => {
    const idx = list.findIndex((p) => p.id === id)
    if (idx !== -1) {
      list.splice(idx, 1)
      return true
    }
    for (const p of list) {
      if (p.children?.length && deleteRec(p.children as Permission[])) return true
    }
    return false
  }

  if (!deleteRec(mockPermissions)) return notFound('Permission not found')
  return ok(null, 'Permission deleted successfully')
}

/**
 * Get permissions for current user
 */
export async function getUserPermissions(): Promise<ApiResponse<Permission[]>> {
  if (!isMock) return request.get('/permissions/user')

  const { mockPermissions } = await import('../../mock/data/permissions.data')
  return ok(mockPermissions)
}
