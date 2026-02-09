import { defineMock } from 'vite-plugin-mock-dev-server'
import { mockPermissions } from '../data/permissions.data'

export default defineMock([
  // Get permission list (tree structure)
  {
    url: '/api/permissions',
    method: 'GET',
    body: {
      code: 200,
      message: 'Success',
      data: mockPermissions,
      success: true
    }
  },

  // Get permission tree (for menu)
  {
    url: '/api/permissions/tree',
    method: 'GET',
    body: {
      code: 200,
      message: 'Success',
      data: mockPermissions,
      success: true
    }
  },

  // Get user permissions
  {
    url: '/api/permissions/user',
    method: 'GET',
    body: (req) => {
      // In a real app, this would be based on the user's roles
      // For now, return all permissions for admin
      const token = req.headers.authorization?.replace('Bearer ', '')
      const userId = token?.split('-')[2]

      if (userId === '1') {
        // Admin - all permissions
        return {
          code: 200,
          message: 'Success',
          data: mockPermissions,
          success: true
        }
      } else {
        // Regular user - limited permissions
        return {
          code: 200,
          message: 'Success',
          data: mockPermissions.filter(p => p.code === 'dashboard.view'),
          success: true
        }
      }
    }
  }
])
