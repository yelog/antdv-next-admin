import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Import after mocking
import { usePermission } from '@/composables/usePermission'

// Mock useAuthStore
const mockAuthStore = {
  userPermissions: [] as string[],
  userRoles: [] as string[],
  hasPermission: vi.fn((permission: string) => {
    return mockAuthStore.userPermissions.includes('*') || mockAuthStore.userPermissions.includes(permission)
  }),
  hasAnyPermission: vi.fn((permissions: string[]) => {
    return permissions.some(p => mockAuthStore.hasPermission(p))
  }),
  hasAllPermissions: vi.fn((permissions: string[]) => {
    return permissions.every(p => mockAuthStore.hasPermission(p))
  }),
  hasRole: vi.fn((role: string) => {
    return mockAuthStore.userRoles.includes(role)
  }),
  hasAnyRole: vi.fn((roles: string[]) => {
    return roles.some(r => mockAuthStore.userRoles.includes(r))
  }),
  hasAllRoles: vi.fn((roles: string[]) => {
    return roles.every(r => mockAuthStore.userRoles.includes(r))
  }),
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

describe('usePermission composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockAuthStore.userPermissions = []
    mockAuthStore.userRoles = []
  })

  describe('can', () => {
    it('should return true when user has the permission', () => {
      mockAuthStore.userPermissions = ['user.create']
      const { can } = usePermission()

      expect(can('user.create')).toBe(true)
    })

    it('should return false when user does not have the permission', () => {
      mockAuthStore.userPermissions = ['user.view']
      const { can } = usePermission()

      expect(can('user.create')).toBe(false)
    })

    it('should return true when user has wildcard permission', () => {
      mockAuthStore.userPermissions = ['*']
      const { can } = usePermission()

      expect(can('any.permission')).toBe(true)
    })
  })

  describe('canAny', () => {
    it('should return true when user has any of the permissions', () => {
      mockAuthStore.userPermissions = ['user.create']
      const { canAny } = usePermission()

      expect(canAny(['user.create', 'user.delete'])).toBe(true)
    })

    it('should return false when user has none of the permissions', () => {
      mockAuthStore.userPermissions = ['user.view']
      const { canAny } = usePermission()

      expect(canAny(['user.create', 'user.delete'])).toBe(false)
    })
  })

  describe('canAll', () => {
    it('should return true when user has all permissions', () => {
      mockAuthStore.userPermissions = ['user.create', 'user.edit']
      const { canAll } = usePermission()

      expect(canAll(['user.create', 'user.edit'])).toBe(true)
    })

    it('should return false when user is missing some permissions', () => {
      mockAuthStore.userPermissions = ['user.create']
      const { canAll } = usePermission()

      expect(canAll(['user.create', 'user.edit'])).toBe(false)
    })
  })

  describe('cannot', () => {
    it('should return true when user does not have the permission', () => {
      mockAuthStore.userPermissions = ['user.view']
      const { cannot } = usePermission()

      expect(cannot('user.create')).toBe(true)
    })

    it('should return false when user has the permission', () => {
      mockAuthStore.userPermissions = ['user.create']
      const { cannot } = usePermission()

      expect(cannot('user.create')).toBe(false)
    })
  })

  describe('hasRole', () => {
    it('should return true when user has the role', () => {
      mockAuthStore.userRoles = ['admin']
      const { hasRole } = usePermission()

      expect(hasRole('admin')).toBe(true)
    })

    it('should return false when user does not have the role', () => {
      mockAuthStore.userRoles = ['user']
      const { hasRole } = usePermission()

      expect(hasRole('admin')).toBe(false)
    })
  })

  describe('hasAnyRole', () => {
    it('should return true when user has any of the roles', () => {
      mockAuthStore.userRoles = ['admin']
      const { hasAnyRole } = usePermission()

      expect(hasAnyRole(['admin', 'super-admin'])).toBe(true)
    })

    it('should return false when user has none of the roles', () => {
      mockAuthStore.userRoles = ['user']
      const { hasAnyRole } = usePermission()

      expect(hasAnyRole(['admin', 'super-admin'])).toBe(false)
    })
  })

  describe('hasAllRoles', () => {
    it('should return true when user has all roles', () => {
      mockAuthStore.userRoles = ['admin', 'editor']
      const { hasAllRoles } = usePermission()

      expect(hasAllRoles(['admin', 'editor'])).toBe(true)
    })

    it('should return false when user is missing some roles', () => {
      mockAuthStore.userRoles = ['admin']
      const { hasAllRoles } = usePermission()

      expect(hasAllRoles(['admin', 'editor'])).toBe(false)
    })
  })
})
