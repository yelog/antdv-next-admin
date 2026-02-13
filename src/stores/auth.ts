import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Role, Permission } from '@/types/auth'

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user_info'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const refreshTokenValue = ref<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY))
  const user = ref<User | null>(null)
  const roles = ref<Role[]>([])
  const permissions = ref<Permission[]>([])

  // Getters
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const userRoles = computed(() => roles.value.map(role => role.code))
  const userPermissions = computed(() => permissions.value.map(perm => perm.code))

  // Actions
  const setToken = (newToken: string | null, newRefreshToken?: string | null) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }

    if (newRefreshToken !== undefined) {
      refreshTokenValue.value = newRefreshToken
      if (newRefreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)
      } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY)
      }
    }
  }

  const setUserInfo = (userInfo: User | null) => {
    user.value = userInfo
    if (userInfo) {
      roles.value = userInfo.roles || []
      permissions.value = userInfo.permissions || []
      localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
    } else {
      roles.value = []
      permissions.value = []
      localStorage.removeItem(USER_KEY)
    }
  }

  const login = async (username: string, password: string): Promise<void> => {
    // Check if using demo mode (no real backend)
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
    const isDemoMode = import.meta.env.VITE_USE_MOCK === 'true' || apiBaseUrl === '/api'

    if (isDemoMode) {
      // Demo mode: Use client-side mock data
      return loginDemo(username, password)
    }

    // Production mode: Call real API
    const { login: loginApi, getUserInfo } = await import('@/api/auth')

    const loginResult = await loginApi({ username, password })
    setToken(loginResult.data.token, loginResult.data.refreshToken)

    const userInfo = await getUserInfo()
    setUserInfo(userInfo.data)
  }

  const loginDemo = async (username: string, password: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Validate credentials
    if ((username === 'admin' || username === 'user') && password === '123456') {
      const isAdmin = username === 'admin'

      // Set token with refresh token
      setToken(
        `demo-token-${isAdmin ? '1' : '2'}-${Date.now()}`,
        `demo-refresh-token-${isAdmin ? '1' : '2'}-${Date.now()}`
      )

      // Set user info
      const userInfo: User = isAdmin ? {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        realName: 'Administrator',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        phone: '13800138000',
        gender: 'male',
        birthDate: '1990-01-01',
        bio: 'System Administrator',
        status: 'active',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        roles: [{
          id: '1',
          name: 'Administrator',
          code: 'admin',
          description: 'System Administrator',
          permissions: [],
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        }],
        permissions: [{
          id: '1',
          name: 'All Permissions',
          code: '*',
          description: 'Has all permissions',
          resource: '*',
          action: '*',
          type: 'api'
        }]
      } : {
        id: '2',
        username: 'user',
        email: 'user@example.com',
        realName: 'Regular User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        phone: '13800138001',
        gender: 'female',
        birthDate: '1995-05-15',
        bio: 'Regular User',
        status: 'active',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        roles: [{
          id: '2',
          name: 'User',
          code: 'user',
          description: 'Regular User',
          permissions: [],
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        }],
        permissions: [{
          id: '2',
          name: 'View Dashboard',
          code: 'dashboard.view',
          description: 'Can view dashboard',
          resource: 'dashboard',
          action: 'view',
          type: 'menu'
        }]
      }

      setUserInfo(userInfo)
    } else {
      throw new Error('Invalid username or password')
    }
  }

  const logout = () => {
    setToken(null, null)
    setUserInfo(null)
  }

  const refreshToken = async (): Promise<string> => {
    // Check if using demo mode
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
    const isDemoMode = import.meta.env.VITE_USE_MOCK === 'true' || apiBaseUrl === '/api'

    if (isDemoMode) {
      // Demo mode: Simulate token refresh
      await new Promise(resolve => setTimeout(resolve, 700))

      if (!refreshTokenValue.value) {
        throw new Error('No refresh token available')
      }

      const newToken = `demo-token-refreshed-${Date.now()}`
      setToken(newToken, refreshTokenValue.value)
      return newToken
    }

    // Production mode: Call real API
    const { refreshToken: refreshTokenApi } = await import('@/api/auth')

    if (!refreshTokenValue.value) {
      throw new Error('No refresh token available')
    }

    const result = await refreshTokenApi(refreshTokenValue.value)
    setToken(result.data.token, result.data.refreshToken)
    return result.data.token
  }

  const hasRole = (role: string): boolean => {
    return userRoles.value.includes(role)
  }

  const hasAnyRole = (roleList: string[]): boolean => {
    return roleList.some(role => hasRole(role))
  }

  const hasAllRoles = (roleList: string[]): boolean => {
    return roleList.every(role => hasRole(role))
  }

  const hasPermission = (permission: string): boolean => {
    return userPermissions.value.includes('*') || userPermissions.value.includes(permission)
  }

  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(perm => hasPermission(perm))
  }

  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every(perm => hasPermission(perm))
  }

  // Initialize from localStorage
  const initAuth = () => {
    const savedUser = localStorage.getItem(USER_KEY)
    if (savedUser) {
      try {
        const userInfo = JSON.parse(savedUser)
        setUserInfo(userInfo)
      } catch (error) {
        console.error('Failed to parse saved user info:', error)
        localStorage.removeItem(USER_KEY)
      }
    }
  }

  return {
    // State
    token,
    refreshTokenValue,
    user,
    roles,
    permissions,
    // Getters
    isLoggedIn,
    userRoles,
    userPermissions,
    // Actions
    setToken,
    setUserInfo,
    login,
    logout,
    refreshToken,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    initAuth
  }
})
