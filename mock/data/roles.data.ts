import type { Role } from '@/types/auth'

export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Administrator',
    code: 'admin',
    description: 'System administrator with full access',
    permissions: [],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Manager',
    code: 'manager',
    description: 'Department manager with management permissions',
    permissions: [],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'User',
    code: 'user',
    description: 'Regular user with basic permissions',
    permissions: [],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '4',
    name: 'Guest',
    code: 'guest',
    description: 'Guest user with read-only access',
    permissions: [],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  }
]
