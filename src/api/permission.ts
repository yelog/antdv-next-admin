import type { ApiResponse } from '@/types/api'
import type { Permission } from '@/types/auth'
import { request } from '@/utils/request'

/**
 * Get permission list
 */
export async function getPermissionList(params?: Record<string, any>): Promise<ApiResponse<Permission[]>> {
  return request.get('/permissions', { params })
}

/**
 * Get permission tree
 */
export async function getPermissionTree(): Promise<ApiResponse<Permission[]>> {
  return request.get('/permissions/tree')
}

/**
 * Get permission by ID
 */
export async function getPermissionById(id: string): Promise<ApiResponse<Permission>> {
  return request.get(`/permissions/${id}`)
}

/**
 * Create permission
 */
export async function createPermission(data: Partial<Permission>): Promise<ApiResponse<Permission>> {
  return request.post('/permissions', data)
}

/**
 * Update permission
 */
export async function updatePermission(id: string, data: Partial<Permission>): Promise<ApiResponse<Permission>> {
  return request.put(`/permissions/${id}`, data)
}

/**
 * Delete permission
 */
export async function deletePermission(id: string): Promise<ApiResponse<null>> {
  return request.delete(`/permissions/${id}`)
}

/**
 * Get permissions for current user
 */
export async function getUserPermissions(): Promise<ApiResponse<Permission[]>> {
  return request.get('/permissions/user')
}
