/**
 * Client-side mock interceptor for production builds on static hosting (GitHub Pages)
 *
 * This module intercepts API requests in the browser and returns mock data,
 * since vite-plugin-mock-dev-server only works in development mode.
 */

import { mockUsers } from '../../mock/data/users.data'
import { mockRoles } from '../../mock/data/roles.data'
import { mockPermissions } from '../../mock/data/permissions.data'
import { departments as mockDepts } from '../../mock/data/dept.data'
import { dictTypes as mockDictTypes, dictData as mockDictData } from '../../mock/data/dict.data'
import { loginLogs as mockLoginLogs, operationLogs as mockOperationLogs } from '../../mock/data/log.data'
import { mockStats, mockSalesTrend, mockUserDistribution, mockActivities, mockChartData } from '../../mock/data/dashboard.data'

// Parse query parameters from URL
function parseQuery(url: string): Record<string, any> {
  const query: Record<string, any> = {}
  const queryString = url.split('?')[1]
  if (queryString) {
    const params = new URLSearchParams(queryString)
    params.forEach((value, key) => {
      query[key] = value
    })
  }
  return query
}

// Match URL pattern
function matchPattern(pattern: string, url: string): { match: boolean; params?: Record<string, string> } {
  const cleanUrl = url.split('?')[0]

  // Convert pattern like "/api/users/:id" to regex
  const regexPattern = pattern
    .replace(/:\w+/g, '([^/]+)')
    .replace(/\*/g, '.*')

  const regex = new RegExp(`^${regexPattern}$`)
  const match = cleanUrl.match(regex)

  if (!match) {
    return { match: false }
  }

  // Extract named parameters
  const params: Record<string, string> = {}
  const paramNames = pattern.match(/:\w+/g) || []
  paramNames.forEach((name, index) => {
    params[name.slice(1)] = match[index + 1]
  })

  return { match: true, params }
}

// Mock handlers
interface MockHandler {
  pattern: string
  method: string
  handler: (req: { query: Record<string, any>; params: Record<string, string>; body?: any }) => any
}

const mockHandlers: MockHandler[] = [
  // Auth - Login
  {
    pattern: '/api/auth/login',
    method: 'POST',
    handler: ({ body }) => {
      const { username, password } = body || {}

      if (password !== '123456') {
        return { code: 401, message: 'Invalid username or password', data: null }
      }

      const user = mockUsers.find(u => u.username === username)
      if (!user) {
        return { code: 401, message: 'Invalid username or password', data: null }
      }

      return {
        code: 200,
        message: 'Login successful',
        data: {
          token: `mock_token_${user.id}`,
          refreshToken: `mock_refresh_${user.id}`,
          expiresIn: 7200,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            realName: user.realName,
            avatar: user.avatar,
            roles: user.roles,
            permissions: user.permissions
          }
        }
      }
    }
  },

  // Auth - Get current user
  {
    pattern: '/api/auth/me',
    method: 'GET',
    handler: () => {
      const user = mockUsers[0]
      return {
        code: 200,
        message: 'Success',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          realName: user.realName,
          avatar: user.avatar,
          roles: user.roles,
          permissions: user.permissions
        }
      }
    }
  },

  // Auth - Logout
  {
    pattern: '/api/auth/logout',
    method: 'POST',
    handler: () => {
      return { code: 200, message: 'Logout successful', data: null }
    }
  },

  // Auth - Refresh token
  {
    pattern: '/api/auth/refresh',
    method: 'POST',
    handler: () => {
      return {
        code: 200,
        message: 'Token refreshed',
        data: {
          token: 'mock_token_refreshed',
          refreshToken: 'mock_refresh_new',
          expiresIn: 7200
        }
      }
    }
  },

  // Users - List
  {
    pattern: '/api/users',
    method: 'GET',
    handler: ({ query }) => {
      const { current = 1, pageSize = 10, username, email, status, gender } = query

      let filteredUsers = [...mockUsers]

      if (username) {
        filteredUsers = filteredUsers.filter(user =>
          user.username.toLowerCase().includes(String(username).toLowerCase())
        )
      }

      if (email) {
        filteredUsers = filteredUsers.filter(user =>
          user.email.toLowerCase().includes(String(email).toLowerCase())
        )
      }

      if (status) {
        filteredUsers = filteredUsers.filter(user => user.status === status)
      }

      if (gender) {
        const genderValues = String(gender).split(',').map(item => item.trim()).filter(Boolean)
        if (genderValues.length > 0) {
          filteredUsers = filteredUsers.filter(user => genderValues.includes(String(user.gender)))
        }
      }

      const start = (Number(current) - 1) * Number(pageSize)
      const end = start + Number(pageSize)
      const list = filteredUsers.slice(start, end)

      return {
        code: 200,
        message: 'Success',
        data: {
          list,
          total: filteredUsers.length,
          current: Number(current),
          pageSize: Number(pageSize)
        }
      }
    }
  },

  // Users - Get by ID
  {
    pattern: '/api/users/:id',
    method: 'GET',
    handler: ({ params }) => {
      const user = mockUsers.find(u => u.id === params.id)
      if (user) {
        return { code: 200, message: 'Success', data: user }
      }
      return { code: 404, message: 'User not found', data: null }
    }
  },

  // Users - Create
  {
    pattern: '/api/users',
    method: 'POST',
    handler: ({ body }) => {
      const newUser = {
        id: `user_${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockUsers.push(newUser)
      return { code: 200, message: 'User created', data: newUser }
    }
  },

  // Users - Update
  {
    pattern: '/api/users/:id',
    method: 'PUT',
    handler: ({ params, body }) => {
      const index = mockUsers.findIndex(u => u.id === params.id)
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...body, updatedAt: new Date().toISOString() }
        return { code: 200, message: 'User updated', data: mockUsers[index] }
      }
      return { code: 404, message: 'User not found', data: null }
    }
  },

  // Users - Delete
  {
    pattern: '/api/users/:id',
    method: 'DELETE',
    handler: ({ params }) => {
      const index = mockUsers.findIndex(u => u.id === params.id)
      if (index !== -1) {
        mockUsers.splice(index, 1)
        return { code: 200, message: 'User deleted', data: null }
      }
      return { code: 404, message: 'User not found', data: null }
    }
  },

  // Users - Change password
  {
    pattern: '/api/users/change-password',
    method: 'POST',
    handler: () => {
      return { code: 200, message: 'Password changed', data: null }
    }
  },

  // Roles - List
  {
    pattern: '/api/roles',
    method: 'GET',
    handler: ({ query }) => {
      const { current = 1, pageSize = 10 } = query
      const start = (Number(current) - 1) * Number(pageSize)
      const end = start + Number(pageSize)
      const list = mockRoles.slice(start, end)

      return {
        code: 200,
        message: 'Success',
        data: {
          list,
          total: mockRoles.length,
          current: Number(current),
          pageSize: Number(pageSize)
        }
      }
    }
  },

  // Roles - All
  {
    pattern: '/api/roles/all',
    method: 'GET',
    handler: () => {
      return { code: 200, message: 'Success', data: mockRoles }
    }
  },

  // Roles - Get by ID
  {
    pattern: '/api/roles/:id',
    method: 'GET',
    handler: ({ params }) => {
      const role = mockRoles.find(r => r.id === params.id)
      if (role) {
        return { code: 200, message: 'Success', data: role }
      }
      return { code: 404, message: 'Role not found', data: null }
    }
  },

  // Roles - Create
  {
    pattern: '/api/roles',
    method: 'POST',
    handler: ({ body }) => {
      const newRole = {
        id: `role_${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString()
      }
      mockRoles.push(newRole)
      return { code: 200, message: 'Role created', data: newRole }
    }
  },

  // Roles - Update
  {
    pattern: '/api/roles/:id',
    method: 'PUT',
    handler: ({ params, body }) => {
      const index = mockRoles.findIndex(r => r.id === params.id)
      if (index !== -1) {
        mockRoles[index] = { ...mockRoles[index], ...body }
        return { code: 200, message: 'Role updated', data: mockRoles[index] }
      }
      return { code: 404, message: 'Role not found', data: null }
    }
  },

  // Roles - Delete
  {
    pattern: '/api/roles/:id',
    method: 'DELETE',
    handler: ({ params }) => {
      const index = mockRoles.findIndex(r => r.id === params.id)
      if (index !== -1) {
        mockRoles.splice(index, 1)
        return { code: 200, message: 'Role deleted', data: null }
      }
      return { code: 404, message: 'Role not found', data: null }
    }
  },

  // Permissions - Tree
  {
    pattern: '/api/permissions/tree',
    method: 'GET',
    handler: () => {
      return { code: 200, message: 'Success', data: mockPermissions }
    }
  },

  // Permissions - User (current user permissions)
  {
    pattern: '/api/permissions/user',
    method: 'GET',
    handler: () => {
      const user = mockUsers[0]
      return {
        code: 200,
        message: 'Success',
        data: user.permissions || []
      }
    }
  },

  // Permissions - All (flattened list)
  {
    pattern: '/api/permissions/all',
    method: 'GET',
    handler: () => {
      const flattenPermissions = (perms: any[]): any[] => {
        return perms.reduce((acc: any[], perm: any) => {
          acc.push(perm)
          if (perm.children?.length) {
            acc.push(...flattenPermissions(perm.children))
          }
          return acc
        }, [])
      }
      return { code: 200, message: 'Success', data: flattenPermissions(mockPermissions) }
    }
  },

  // Departments - Tree
  {
    pattern: '/api/depts/tree',
    method: 'GET',
    handler: () => {
      return { code: 200, message: 'Success', data: mockDepts }
    }
  },

  // Dictionary Types
  {
    pattern: '/api/dict-types',
    method: 'GET',
    handler: ({ query }) => {
      const { current = 1, pageSize = 10 } = query
      const start = (Number(current) - 1) * Number(pageSize)
      const end = start + Number(pageSize)
      const list = mockDictTypes.slice(start, end)

      return {
        code: 200,
        message: 'Success',
        data: {
          list,
          total: mockDictTypes.length,
          current: Number(current),
          pageSize: Number(pageSize)
        }
      }
    }
  },

  // Dictionary Data
  {
    pattern: '/api/dict-data',
    method: 'GET',
    handler: ({ query }) => {
      const { dictType } = query
      let data = mockDictData
      if (dictType) {
        data = data.filter((d: any) => d.dictType === dictType)
      }
      return { code: 200, message: 'Success', data }
    }
  },

  // Dictionary Data - All (alternative path)
  {
    pattern: '/api/dict/data/all',
    method: 'GET',
    handler: () => {
      return { code: 200, message: 'Success', data: mockDictData }
    }
  },

  // Dictionary Types - Alternative paths
  {
    pattern: '/api/dict/types',
    method: 'GET',
    handler: () => {
      return { code: 200, message: 'Success', data: mockDictTypes }
    }
  },

  // Dictionary Type - List
  {
    pattern: '/api/dict/type/list',
    method: 'GET',
    handler: ({ query }) => {
      const { current = 1, pageSize = 10 } = query
      const start = (Number(current) - 1) * Number(pageSize)
      const end = start + Number(pageSize)
      const list = mockDictTypes.slice(start, end)

      return {
        code: 200,
        message: 'Success',
        data: {
          list,
          total: mockDictTypes.length,
          current: Number(current),
          pageSize: Number(pageSize)
        }
      }
    }
  },

  // Dictionary Data - List
  {
    pattern: '/api/dict/data/list',
    method: 'GET',
    handler: ({ query }) => {
      const { current = 1, pageSize = 10, dictType } = query
      let data = mockDictData
      if (dictType) {
        data = data.filter((d: any) => d.dictType === dictType)
      }
      const start = (Number(current) - 1) * Number(pageSize)
      const end = start + Number(pageSize)
      const list = data.slice(start, end)

      return {
        code: 200,
        message: 'Success',
        data: {
          list,
          total: data.length,
          current: Number(current),
          pageSize: Number(pageSize)
        }
      }
    }
  },

  // Dictionary Data by Type
  {
    pattern: '/api/dict/data/:typeCode',
    method: 'GET',
    handler: ({ params }) => {
      const data = mockDictData.filter((d: any) => d.dictType === params.typeCode)
      return { code: 200, message: 'Success', data }
    }
  },

  // Dashboard
  {
    pattern: '/api/dashboard',
    method: 'GET',
    handler: () => {
      return {
        code: 200,
        message: 'Success',
        data: {
          stats: mockStats,
          salesTrend: mockSalesTrend,
          userDistribution: mockUserDistribution,
          activities: mockActivities,
          chartData: mockChartData
        }
      }
    }
  },

  // Dashboard - Stats
  {
    pattern: '/api/dashboard/stats',
    method: 'GET',
    handler: () => {
      return {
        code: 200,
        message: 'Success',
        data: {
          totalUsers: mockUsers.length,
          totalRoles: mockRoles.length,
          todayVisits: Math.floor(Math.random() * 1000),
          activeUsers: Math.floor(Math.random() * 100)
        }
      }
    }
  },

  // Login Logs
  {
    pattern: '/api/logs/login',
    method: 'GET',
    handler: ({ query }) => {
      const { current = 1, pageSize = 10 } = query
      const start = (Number(current) - 1) * Number(pageSize)
      const end = start + Number(pageSize)
      const list = mockLoginLogs.slice(start, end)

      return {
        code: 200,
        message: 'Success',
        data: {
          list,
          total: mockLoginLogs.length,
          current: Number(current),
          pageSize: Number(pageSize)
        }
      }
    }
  },

  // Operation Logs
  {
    pattern: '/api/logs/operation',
    method: 'GET',
    handler: ({ query }) => {
      const { current = 1, pageSize = 10 } = query
      const start = (Number(current) - 1) * Number(pageSize)
      const end = start + Number(pageSize)
      const list = mockOperationLogs.slice(start, end)

      return {
        code: 200,
        message: 'Success',
        data: {
          list,
          total: mockOperationLogs.length,
          current: Number(current),
          pageSize: Number(pageSize)
        }
      }
    }
  },

  // Config
  {
    pattern: '/api/config',
    method: 'GET',
    handler: () => {
      return {
        code: 200,
        message: 'Success',
        data: {
          siteName: 'Antdv Next Admin',
          logo: '/logo.png',
          version: '1.0.0'
        }
      }
    }
  },

  // Upload
  {
    pattern: '/api/upload',
    method: 'POST',
    handler: () => {
      return {
        code: 200,
        message: 'Upload successful',
        data: {
          url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
          name: 'uploaded_file'
        }
      }
    }
  }
]

// Find matching mock handler
function findMockHandler(url: string, method: string): MockHandler | null {
  return mockHandlers.find(handler => {
    const { match } = matchPattern(handler.pattern, url)
    return match && handler.method === method.toUpperCase()
  }) || null
}

// Execute mock handler
async function executeMockHandler(
  handler: MockHandler,
  url: string,
  init?: RequestInit
): Promise<Response> {
  const { params } = matchPattern(handler.pattern, url)
  const query = parseQuery(url)

  let body: any
  if (init?.body) {
    try {
      body = JSON.parse(init.body as string)
    } catch {
      body = init.body
    }
  }

  const result = handler.handler({ query, params: params || {}, body })

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300))

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// Check if should intercept this request
function shouldIntercept(url: string): boolean {
  // Only intercept API requests
  return url.includes('/api/')
}

// Setup mock interceptor
export function setupMockInterceptor(): void {
  // Only run in production with mock enabled
  const isMockEnabled = import.meta.env.VITE_USE_MOCK === 'true'
  const isDev = import.meta.env.DEV

  if (isDev || !isMockEnabled) {
    return
  }

  // Save original fetch
  const originalFetch = window.fetch

  // Override fetch
  window.fetch = async function(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const url = input.toString()

    // Check if we should intercept this request
    if (!shouldIntercept(url)) {
      return originalFetch(input, init)
    }

    // Find mock handler
    const handler = findMockHandler(url, init?.method || 'GET')

    if (handler) {
      console.log('[Mock]', init?.method || 'GET', url)
      return executeMockHandler(handler, url, init)
    }

    // No handler found, return 404
    console.warn('[Mock] No handler found for:', url)
    return new Response(
      JSON.stringify({ code: 404, message: 'Not found', data: null }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    )
  }

  console.log('[Mock] Client-side mock interceptor enabled')
}
