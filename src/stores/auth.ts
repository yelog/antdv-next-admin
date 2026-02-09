import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Role, Permission } from '@/types/auth'

const TOKEN_KEY = 'access_token'
const USER_KEY = 'user_info'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<User | null>(null)
  const roles = ref<Role[]>([])
  const permissions = ref<Permission[]>([])

  // Getters
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const userRoles = computed(() => roles.value.map(role => role.code))
  const userPermissions = computed(() => permissions.value.map(perm => perm.code))

  // Actions
  const setToken = (newToken: string | null) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken)
    } else {
      localStorage.removeItem(TOKEN_KEY)
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
    const { login: loginApi, getUserInfo } = await import('@/api/auth')

    const loginResult = await loginApi({ username, password })
    setToken(loginResult.data.token)

    const userInfo = await getUserInfo()
    setUserInfo(userInfo.data)
  }

  const logout = () => {
    setToken(null)
    setUserInfo(null)
  }

  const refreshToken = async (): Promise<void> => {
    // This will be replaced with actual API call
    throw new Error('Refresh token API not implemented yet')
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
