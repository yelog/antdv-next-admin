import { defineMock } from 'vite-plugin-mock-dev-server';

import { adminUser, regularUser } from '../data/users.data';

function resolveMockUserIdFromToken(token?: string) {
  if (!token) return null;
  const parts = token.split('-');
  const tokenIndex = parts.indexOf('token');
  const refreshIndex = parts.indexOf('refresh');
  const userIdIndex = tokenIndex !== -1 ? tokenIndex + 1 : refreshIndex + 2;
  const userId = parts[userIdIndex];
  return userId === '1' || userId === '2' ? userId : null;
}

function createMockToken(userId: string) {
  return `mock-token-${userId}-${Date.now()}`;
}

function createMockRefreshToken(userId: string) {
  return `mock-refresh-token-${userId}-${Date.now()}`;
}

export default defineMock([
  // Login
  {
    url: '/api/auth/login',
    method: 'POST',
    body: (req) => {
      const { username, password } = req.body;

      // Validate credentials
      let user = null;
      if (username === 'admin' && password === '123456') {
        user = adminUser;
      } else if (username === 'user' && password === '123456') {
        user = regularUser;
      }

      if (user) {
        return {
          code: 200,
          message: 'Login successful',
          data: {
            token: createMockToken(user.id),
            refreshToken: createMockRefreshToken(user.id),
            expiresIn: 7200,
          },
          success: true,
        };
      } else {
        return {
          code: 401,
          message: 'Invalid username or password',
          data: null,
          success: false,
        };
      }
    },
  },

  // Logout
  {
    url: '/api/auth/logout',
    method: 'POST',
    body: {
      code: 200,
      message: 'Logout successful',
      data: null,
      success: true,
    },
  },

  // Get user info
  {
    url: '/api/auth/info',
    method: 'GET',
    body: (req) => {
      // Get token from header
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return {
          code: 401,
          message: 'Unauthorized',
          data: null,
          success: false,
        };
      }

      // Extract user ID from token
      const userId = resolveMockUserIdFromToken(token);
      if (!userId) {
        return {
          code: 401,
          message: 'Invalid token',
          data: null,
          success: false,
        };
      }
      const user = userId === '1' ? adminUser : regularUser;

      return {
        code: 200,
        message: 'Success',
        data: user,
        success: true,
      };
    },
  },

  // Refresh token
  {
    url: '/api/auth/refresh',
    method: 'POST',
    body: (req) => {
      const { refreshToken } = req.body;

      const userId = resolveMockUserIdFromToken(refreshToken);

      if (userId) {
        return {
          code: 200,
          message: 'Token refreshed',
          data: {
            token: createMockToken(userId),
            refreshToken: createMockRefreshToken(userId),
            expiresIn: 7200,
          },
          success: true,
        };
      } else {
        return {
          code: 401,
          message: 'Invalid refresh token',
          data: null,
          success: false,
        };
      }
    },
  },
]);
