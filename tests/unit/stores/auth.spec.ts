import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock import.meta.env
vi.stubGlobal('import.meta', {
  env: {
    VITE_USE_MOCK: 'true',
    VITE_API_BASE_URL: '/api'
  }
})

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have null token initially', () => {
      const store = useAuthStore()
      expect(store.token).toBeNull()
    })

    it('should have null user initially', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
    })

    it('should have empty roles initially', () => {
      const store = useAuthStore()
      expect(store.roles).toEqual([])
    })

    it('should have empty permissions initially', () => {
      const store = useAuthStore()
      expect(store.permissions).toEqual([])
    })
  })

  describe('isLoggedIn computed', () => {
    it('should return false when no token or user', () => {
      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(false)
    })

    it('should return false when only token exists', () => {
      const store = useAuthStore()
      store.setToken('test-token')
      expect(store.isLoggedIn).toBe(false)
    })
  })

  describe('setToken', () => {
    it('should set token in store and localStorage', () => {
      const store = useAuthStore()
      store.setToken('new-token')

      expect(store.token).toBe('new-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'new-token')
    })

    it('should remove token when set to null', () => {
      const store = useAuthStore()
      store.setToken('test-token')
      store.setToken(null)

      expect(store.token).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token')
    })

    it('should set refresh token when provided', () => {
      const store = useAuthStore()
      store.setToken('new-token', 'new-refresh-token')

      expect(store.refreshTokenValue).toBe('new-refresh-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'new-refresh-token')
    })
  })

  describe('setUserInfo', () => {
    it('should set user info and extract roles', () => {
      const store = useAuthStore()
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [{ id: '1', name: 'Admin', code: 'admin', description: '', permissions: [], createdAt: '', updatedAt: '' }],
        permissions: []
      }

      store.setUserInfo(userInfo)

      expect(store.user).toEqual(userInfo)
      expect(store.userRoles).toEqual(['admin'])
    })

    it('should extract permissions from user info', () => {
      const store = useAuthStore()
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [],
        permissions: [{ id: '1', name: 'Create', code: 'user.create', description: '', resource: 'user', action: 'create', type: 'api' as const }]
      }

      store.setUserInfo(userInfo)

      expect(store.userPermissions).toEqual(['user.create'])
    })

    it('should clear roles and permissions when set to null', () => {
      const store = useAuthStore()

      // First set some user info
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [{ id: '1', name: 'Admin', code: 'admin', description: '', permissions: [], createdAt: '', updatedAt: '' }],
        permissions: []
      }
      store.setUserInfo(userInfo)

      // Then clear it
      store.setUserInfo(null)

      expect(store.user).toBeNull()
      expect(store.roles).toEqual([])
      expect(store.permissions).toEqual([])
    })
  })

  describe('hasRole', () => {
    it('should return true when user has the role', () => {
      const store = useAuthStore()
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [{ id: '1', name: 'Admin', code: 'admin', description: '', permissions: [], createdAt: '', updatedAt: '' }],
        permissions: []
      }
      store.setUserInfo(userInfo)

      expect(store.hasRole('admin')).toBe(true)
    })

    it('should return false when user does not have the role', () => {
      const store = useAuthStore()
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [{ id: '1', name: 'User', code: 'user', description: '', permissions: [], createdAt: '', updatedAt: '' }],
        permissions: []
      }
      store.setUserInfo(userInfo)

      expect(store.hasRole('admin')).toBe(false)
    })
  })

  describe('hasAnyRole', () => {
    it('should return true when user has any of the roles', () => {
      const store = useAuthStore()
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [{ id: '1', name: 'Admin', code: 'admin', description: '', permissions: [], createdAt: '', updatedAt: '' }],
        permissions: []
      }
      store.setUserInfo(userInfo)

      expect(store.hasAnyRole(['admin', 'super-admin'])).toBe(true)
    })

    it('should return false when user has none of the roles', () => {
      const store = useAuthStore()
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [{ id: '1', name: 'User', code: 'user', description: '', permissions: [], createdAt: '', updatedAt: '' }],
        permissions: []
      }
      store.setUserInfo(userInfo)

      expect(store.hasAnyRole(['admin', 'super-admin'])).toBe(false)
    })
  })

  describe('hasAllRoles', () => {
    it('should return true when user has all roles', () => {
      const store = useAuthStore()
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [
          { id: '1', name: 'Admin', code: 'admin', description: '', permissions: [], createdAt: '', updatedAt: '' },
          { id: '2', name: 'Editor', code: 'editor', description: '', permissions: [], createdAt: '', updatedAt: '' }
        ],
        permissions: []
      }
      store.setUserInfo(userInfo)

      expect(store.hasAllRoles(['admin', 'editor'])).toBe(true)
    })

    it('should return false when user is missing some roles', () => {
      const store = useAuthStore()
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [{ id: '1', name: 'Admin', code: 'admin', description: '', permissions: [], createdAt: '', updatedAt: '' }],
        permissions: []
      }
      store.setUserInfo(userInfo)

      expect(store.hasAllRoles(['admin', 'editor'])).toBe(false)
    })
  })

  describe('hasPermission', () => {
    it('should return true when user has the permission', () => {
      const store = useAuthStore()
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [],
        permissions: [{ id: '1', name: 'Create', code: 'user.create', description: '', resource: 'user', action: 'create', type: 'api' as const }]
      }
      store.setUserInfo(userInfo)

      expect(store.hasPermission('user.create')).toBe(true)
    })

    it('should return true when user has wildcard permission', () => {
      const store = useAuthStore()
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [],
        permissions: [{ id: '1', name: 'All', code: '*', description: '', resource: '*', action: '*', type: 'api' as const }]
      }
      store.setUserInfo(userInfo)

      expect(store.hasPermission('user.create')).toBe(true)
      expect(store.hasPermission('any.permission')).toBe(true)
    })

    it('should return false when user does not have the permission', () => {
      const store = useAuthStore()
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [],
        permissions: [{ id: '1', name: 'View', code: 'user.view', description: '', resource: 'user', action: 'view', type: 'api' as const }]
      }
      store.setUserInfo(userInfo)

      expect(store.hasPermission('user.create')).toBe(false)
    })
  })

  describe('hasAnyPermission', () => {
    it('should return true when user has any of the permissions', () => {
      const store = useAuthStore()
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [],
        permissions: [{ id: '1', name: 'Create', code: 'user.create', description: '', resource: 'user', action: 'create', type: 'api' as const }]
      }
      store.setUserInfo(userInfo)

      expect(store.hasAnyPermission(['user.create', 'user.delete'])).toBe(true)
    })

    it('should return false when user has none of the permissions', () => {
      const store = useAuthStore()
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [],
        permissions: [{ id: '1', name: 'View', code: 'user.view', description: '', resource: 'user', action: 'view', type: 'api' as const }]
      }
      store.setUserInfo(userInfo)

      expect(store.hasAnyPermission(['user.create', 'user.delete'])).toBe(false)
    })
  })

  describe('hasAllPermissions', () => {
    it('should return true when user has all permissions', () => {
      const store = useAuthStore()
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [],
        permissions: [
          { id: '1', name: 'Create', code: 'user.create', description: '', resource: 'user', action: 'create', type: 'api' as const },
          { id: '2', name: 'Edit', code: 'user.edit', description: '', resource: 'user', action: 'edit', type: 'api' as const }
        ]
      }
      store.setUserInfo(userInfo)

      expect(store.hasAllPermissions(['user.create', 'user.edit'])).toBe(true)
    })

    it('should return false when user is missing some permissions', () => {
      const store = useAuthStore()
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [],
        permissions: [{ id: '1', name: 'Create', code: 'user.create', description: '', resource: 'user', action: 'create', type: 'api' as const }]
      }
      store.setUserInfo(userInfo)

      expect(store.hasAllPermissions(['user.create', 'user.edit'])).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear all auth data', () => {
      const store = useAuthStore()

      // Set some data first
      store.setToken('test-token', 'test-refresh-token')
      const userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        roles: [{ id: '1', name: 'Admin', code: 'admin', description: '', permissions: [], createdAt: '', updatedAt: '' }],
        permissions: []
      }
      store.setUserInfo(userInfo)

      // Logout
      store.logout()

      expect(store.token).toBeNull()
      expect(store.refreshTokenValue).toBeNull()
      expect(store.user).toBeNull()
      expect(store.roles).toEqual([])
      expect(store.permissions).toEqual([])
    })
  })
})