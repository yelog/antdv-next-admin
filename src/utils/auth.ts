import { localStorage } from './storage'

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

/**
 * Get token from localStorage
 */
export function getToken(): string | null {
  return localStorage.get<string>(TOKEN_KEY)
}

/**
 * Set token to localStorage
 */
export function setToken(token: string): void {
  localStorage.set(TOKEN_KEY, token)
}

/**
 * Remove token from localStorage
 */
export function removeToken(): void {
  localStorage.remove(TOKEN_KEY)
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.get<string>(REFRESH_TOKEN_KEY)
}

/**
 * Set refresh token
 */
export function setRefreshToken(token: string): void {
  localStorage.set(REFRESH_TOKEN_KEY, token)
}

/**
 * Remove refresh token
 */
export function removeRefreshToken(): void {
  localStorage.remove(REFRESH_TOKEN_KEY)
}

/**
 * Clear all auth data
 */
export function clearAuthData(): void {
  removeToken()
  removeRefreshToken()
  localStorage.remove('user_info')
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  return !!getToken()
}
