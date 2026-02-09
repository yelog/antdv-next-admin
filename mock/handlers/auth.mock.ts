import { defineMock } from 'vite-plugin-mock-dev-server'
import { adminUser, regularUser } from '../data/users.data'

export default defineMock([
  // Login
  {
    url: '/api/auth/login',
    method: 'POST',
    body: (req) => {
      const { username, password } = req.body

      // Validate credentials
      let user = null
      if (username === 'admin' && password === '123456') {
        user = adminUser
      } else if (username === 'user' && password === '123456') {
        user = regularUser
      }

      if (user) {
        return {
          code: 200,
          message: 'Login successful',
          data: {
            token: `mock-token-${user.id}-${Date.now()}`,
            refreshToken: `mock-refresh-token-${user.id}-${Date.now()}`,
            expiresIn: 7200
          },
          success: true
        }
      } else {
        return {
          code: 401,
          message: 'Invalid username or password',
          data: null,
          success: false
        }
      }
    }
  },

  // Logout
  {
    url: '/api/auth/logout',
    method: 'POST',
    body: {
      code: 200,
      message: 'Logout successful',
      data: null,
      success: true
    }
  },

  // Get user info
  {
    url: '/api/auth/info',
    method: 'GET',
    body: (req) => {
      // Get token from header
      const token = req.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        return {
          code: 401,
          message: 'Unauthorized',
          data: null,
          success: false
        }
      }

      // Extract user ID from token
      const userId = token.split('-')[2]
      const user = userId === '1' ? adminUser : regularUser

      return {
        code: 200,
        message: 'Success',
        data: user,
        success: true
      }
    }
  },

  // Refresh token
  {
    url: '/api/auth/refresh',
    method: 'POST',
    body: (req) => {
      const { refreshToken } = req.body

      if (refreshToken) {
        return {
          code: 200,
          message: 'Token refreshed',
          data: {
            token: `new-mock-token-${Date.now()}`,
            refreshToken: `new-mock-refresh-token-${Date.now()}`,
            expiresIn: 7200
          },
          success: true
        }
      } else {
        return {
          code: 401,
          message: 'Invalid refresh token',
          data: null,
          success: false
        }
      }
    }
  }
])
