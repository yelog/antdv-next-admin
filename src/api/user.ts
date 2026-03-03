import type { ApiResponse, PageParams, PageResult } from '@/types/api'
import type { User } from '@/types/auth'
import { request } from '@/utils/request'

/**
 * Get user list
 */
export async function getUserList(params: PageParams): Promise<ApiResponse<PageResult<User>>> {
  return request.get('/users', { params })
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<ApiResponse<User>> {
  return request.get(`/users/${id}`)
}

/**
 * Create user
 */
export async function createUser(data: Partial<User>): Promise<ApiResponse<User>> {
  return request.post('/users', data)
}

/**
 * Update user
 */
export async function updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
  return request.put(`/users/${id}`, data)
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<ApiResponse<null>> {
  return request.delete(`/users/${id}`)
}

/**
 * Change password
 */
export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
}

export async function changePassword(params: ChangePasswordParams): Promise<ApiResponse<null>> {
  return request.post('/users/change-password', params)
}
