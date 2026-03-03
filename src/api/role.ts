import { request } from '@/utils/request'
import type { Role } from '@/types/auth'
import type { ApiResponse, PageParams, PageResult } from '@/types/api'

/**
 * Get role list
 */
export async function getRoleList(params: PageParams): Promise<ApiResponse<PageResult<Role>>> {
  return request.get('/roles', { params })
}

/**
 * Get role by ID
 */
export async function getRoleById(id: string): Promise<ApiResponse<Role>> {
  return request.get(`/roles/${id}`)
}

/**
 * Create role
 */
export async function createRole(data: Partial<Role>): Promise<ApiResponse<Role>> {
  return request.post('/roles', data)
}

/**
 * Update role
 */
export async function updateRole(id: string, data: Partial<Role>): Promise<ApiResponse<Role>> {
  return request.put(`/roles/${id}`, data)
}

/**
 * Delete role
 */
export async function deleteRole(id: string): Promise<ApiResponse<null>> {
  return request.delete(`/roles/${id}`)
}