import { beforeEach, describe, expect, it, vi } from 'vitest'
import { filterRoutesByPermission } from '@/router/utils'
import type { AppRouteRecordRaw } from '@/types/router'

// Mock route type with meta
const createMockRoute = (
  name: string,
  options: {
    permissions?: string[]
    roles?: string[]
    children?: AppRouteRecordRaw[]
  } = {}
): AppRouteRecordRaw => ({
  path: `/${name}`,
  name,
  component: {} as any,
  meta: {
    title: name,
    requiredPermissions: options.permissions,
    requiredRoles: options.roles
  },
  children: options.children
})

describe('Route Utils', () => {
  describe('filterRoutesByPermission', () => {
    it('should return all routes when user has wildcard permission', () => {
      const routes: AppRouteRecordRaw[] = [
        createMockRoute('dashboard', { permissions: ['dashboard.view'] }),
        createMockRoute('users', { permissions: ['user.view'] }),
        createMockRoute('settings', { permissions: ['settings.view'] })
      ]

      const result = filterRoutesByPermission(routes, ['*'])

      expect(result).toHaveLength(3)
    })

    it('should filter routes based on permissions', () => {
      const routes: AppRouteRecordRaw[] = [
        createMockRoute('dashboard', { permissions: ['dashboard.view'] }),
        createMockRoute('users', { permissions: ['user.view'] }),
        createMockRoute('settings', { permissions: ['settings.view'] })
      ]

      const result = filterRoutesByPermission(routes, ['dashboard.view', 'user.view'])

      expect(result).toHaveLength(2)
      expect(result.find(r => r.name === 'dashboard')).toBeDefined()
      expect(result.find(r => r.name === 'users')).toBeDefined()
      expect(result.find(r => r.name === 'settings')).toBeUndefined()
    })

    it('should include routes without permission requirements', () => {
      const routes: AppRouteRecordRaw[] = [
        createMockRoute('public'),
        createMockRoute('users', { permissions: ['user.view'] })
      ]

      const result = filterRoutesByPermission(routes, [])

      expect(result).toHaveLength(1)
      expect(result.find(r => r.name === 'public')).toBeDefined()
    })

    it('should handle nested routes', () => {
      const routes: AppRouteRecordRaw[] = [
        createMockRoute('system', {
          children: [
            createMockRoute('users', { permissions: ['user.view'] }),
            createMockRoute('roles', { permissions: ['role.view'] }),
            createMockRoute('public')
          ]
        })
      ]

      const result = filterRoutesByPermission(routes, ['user.view'])

      expect(result).toHaveLength(1)
      expect(result[0].children).toHaveLength(2)
      expect(result[0].children?.find(c => c.name === 'users')).toBeDefined()
      expect(result[0].children?.find(c => c.name === 'public')).toBeDefined()
    })

    it('should return empty array when no routes match', () => {
      const routes: AppRouteRecordRaw[] = [
        createMockRoute('users', { permissions: ['user.view'] }),
        createMockRoute('roles', { permissions: ['role.view'] })
      ]

      const result = filterRoutesByPermission(routes, ['dashboard.view'])

      expect(result).toHaveLength(0)
    })

    it('should handle OR logic for permissions (any match)', () => {
      const routes: AppRouteRecordRaw[] = [
        createMockRoute('users', { permissions: ['user.view', 'user.edit'] })
      ]

      // Route should be included if user has ANY of the required permissions
      const result = filterRoutesByPermission(routes, ['user.view'])

      expect(result).toHaveLength(1)
    })

    it('should preserve route meta and other properties', () => {
      const routes: AppRouteRecordRaw[] = [
        {
          ...createMockRoute('users', { permissions: ['user.view'] }),
          meta: {
            title: 'Users',
            icon: 'UserOutlined',
            requiredPermissions: ['user.view'],
            order: 1
          }
        }
      ]

      const result = filterRoutesByPermission(routes, ['user.view'])

      expect(result[0].meta?.title).toBe('Users')
      expect(result[0].meta?.icon).toBe('UserOutlined')
      expect(result[0].meta?.order).toBe(1)
    })
  })
})