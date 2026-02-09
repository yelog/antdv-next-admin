import { request } from '@/utils/request'
import type { User } from '@/types/auth'
import type { ApiResponse, PageParams, PageResult } from '@/types/api'

/**
 * Get user list
 */
export function getUserList(params: PageParams): Promise<ApiResponse<PageResult<User>>> {
  return request.get('/users', { params })
}

/**
 * Get user by ID
 */
export function getUserById(id: string): Promise<ApiResponse<User>> {
  return request.get(`/users/${id}`)
}

/**
 * Create user
 */
export function createUser(data: Partial<User>): Promise<ApiResponse<User>> {
  return request.post('/users', data)
}

/**
 * Update user
 */
export function updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
  return request.put(`/users/${id}`, data)
}

/**
 * Delete user
 */
export function deleteUser(id: string): Promise<ApiResponse<null>> {
  return request.delete(`/users/${id}`)
}
