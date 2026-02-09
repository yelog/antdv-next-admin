import { request } from '@/utils/request'
import type { Role } from '@/types/auth'
import type { ApiResponse, PageParams, PageResult } from '@/types/api'

/**
 * Get role list
 */
export function getRoleList(params: PageParams): Promise<ApiResponse<PageResult<Role>>> {
  return request.get('/roles', { params })
}

/**
 * Get role by ID
 */
export function getRoleById(id: string): Promise<ApiResponse<Role>> {
  return request.get(`/roles/${id}`)
}

/**
 * Create role
 */
export function createRole(data: Partial<Role>): Promise<ApiResponse<Role>> {
  return request.post('/roles', data)
}

/**
 * Update role
 */
export function updateRole(id: string, data: Partial<Role>): Promise<ApiResponse<Role>> {
  return request.put(`/roles/${id}`, data)
}

/**
 * Delete role
 */
export function deleteRole(id: string): Promise<ApiResponse<null>> {
  return request.delete(`/roles/${id}`)
}
