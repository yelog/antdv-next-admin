import type { ApiResponse } from '@/types/api';
import type { LoginParams, LoginResult, User } from '@/types/auth';

import { request } from '@/utils/request';

/**
 * Login
 */
export function login(data: LoginParams): Promise<ApiResponse<LoginResult>> {
  return request.post('/auth/login', data, { skipAuth: true });
}

/**
 * Logout
 */
export function logout(): Promise<ApiResponse<null>> {
  return request.post('/auth/logout');
}

/**
 * Get user info
 */
export function getUserInfo(): Promise<ApiResponse<User>> {
  return request.get('/auth/info');
}

/**
 * Refresh token
 */
export function refreshToken(
  token: string,
): Promise<ApiResponse<LoginResult>> {
  return request.post(
    '/auth/refresh',
    { refreshToken: token },
    { skipAuth: true, skipAuthRefresh: true },
  );
}
