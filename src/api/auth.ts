import { request } from '@/utils/request'
import type { LoginParams, LoginResult, User } from '@/types/auth'
import type { ApiResponse } from '@/types/api'

/**
 * Login
 */
export function login(data: LoginParams): Promise<ApiResponse<LoginResult>> {
  return request.post('/auth/login', data)
}

/**
 * Logout
 */
export function logout(): Promise<ApiResponse<null>> {
  return request.post('/auth/logout')
}

/**
 * Get user info
 */
export function getUserInfo(): Promise<ApiResponse<User>> {
  return request.get('/auth/info')
}

/**
 * Refresh token
 */
export function refreshToken(refreshToken: string): Promise<ApiResponse<LoginResult>> {
  return request.post('/auth/refresh', { refreshToken })
}
