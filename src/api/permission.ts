import { request } from '@/utils/request'
import type { Permission } from '@/types/auth'
import type { ApiResponse } from '@/types/api'

/**
 * Get permission list
 */
export function getPermissionList(): Promise<ApiResponse<Permission[]>> {
  return request.get('/permissions')
}

/**
 * Get permission tree
 */
export function getPermissionTree(): Promise<ApiResponse<Permission[]>> {
  return request.get('/permissions/tree')
}

/**
 * Get permission by ID
 */
export function getPermissionById(id: string): Promise<ApiResponse<Permission>> {
  return request.get(`/permissions/${id}`)
}

/**
 * Create permission
 */
export function createPermission(data: Partial<Permission>): Promise<ApiResponse<Permission>> {
  return request.post('/permissions', data)
}

/**
 * Update permission
 */
export function updatePermission(id: string, data: Partial<Permission>): Promise<ApiResponse<Permission>> {
  return request.put(`/permissions/${id}`, data)
}

/**
 * Delete permission
 */
export function deletePermission(id: string): Promise<ApiResponse<null>> {
  return request.delete(`/permissions/${id}`)
}

/**
 * Get permissions for current user
 */
export function getUserPermissions(): Promise<ApiResponse<Permission[]>> {
  return request.get('/permissions/user')
}
