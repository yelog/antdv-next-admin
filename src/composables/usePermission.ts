import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * Permission composable
 */
export function usePermission() {
  const authStore = useAuthStore()

  const permissions = computed(() => authStore.userPermissions)
  const roles = computed(() => authStore.userRoles)

  /**
   * Check if user has permission
   */
  const can = (permission: string): boolean => {
    return authStore.hasPermission(permission)
  }

  /**
   * Check if user has any of the permissions
   */
  const canAny = (permissionList: string[]): boolean => {
    return authStore.hasAnyPermission(permissionList)
  }

  /**
   * Check if user has all permissions
   */
  const canAll = (permissionList: string[]): boolean => {
    return authStore.hasAllPermissions(permissionList)
  }

  /**
   * Check if user does not have permission
   */
  const cannot = (permission: string): boolean => {
    return !authStore.hasPermission(permission)
  }

  /**
   * Check if user has role
   */
  const hasRole = (role: string): boolean => {
    return authStore.hasRole(role)
  }

  /**
   * Check if user has any of the roles
   */
  const hasAnyRole = (roleList: string[]): boolean => {
    return authStore.hasAnyRole(roleList)
  }

  /**
   * Check if user has all roles
   */
  const hasAllRoles = (roleList: string[]): boolean => {
    return authStore.hasAllRoles(roleList)
  }

  return {
    permissions,
    roles,
    can,
    canAny,
    canAll,
    cannot,
    hasRole,
    hasAnyRole,
    hasAllRoles
  }
}
