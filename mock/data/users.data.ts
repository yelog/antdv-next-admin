import { faker } from '@faker-js/faker'
import type { User } from '@/types/auth'

// Generate mock users
export const mockUsers: User[] = Array.from({ length: 50 }, (_, index) => ({
  id: faker.string.uuid(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  realName: faker.person.fullName(),
  avatar: faker.image.avatar(),
  phone: `1${faker.string.numeric(10)}`,
  gender: faker.helpers.arrayElement(['male', 'female'] as const),
  birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0],
  bio: faker.person.bio(),
  status: faker.helpers.arrayElement(['active', 'inactive'] as const),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  roles: [],
  permissions: []
}))

// Admin user
export const adminUser: User = {
  id: '1',
  username: 'admin',
  email: 'admin@example.com',
  realName: 'Administrator',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  phone: '13800138000',
  gender: 'male',
  birthDate: '1990-01-01',
  bio: 'System Administrator',
  status: 'active',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
  roles: [
    {
      id: '1',
      name: 'Administrator',
      code: 'admin',
      description: 'System Administrator',
      permissions: [],
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    }
  ],
  permissions: [
    {
      id: '1',
      name: 'All Permissions',
      code: '*',
      description: 'Has all permissions',
      resource: '*',
      action: '*',
      type: 'api'
    }
  ]
}

// Regular user
export const regularUser: User = {
  id: '2',
  username: 'user',
  email: 'user@example.com',
  realName: 'Regular User',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
  phone: '13800138001',
  gender: 'female',
  birthDate: '1995-05-15',
  bio: 'Regular User',
  status: 'active',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
  roles: [
    {
      id: '2',
      name: 'User',
      code: 'user',
      description: 'Regular User',
      permissions: [],
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    }
  ],
  permissions: [
    {
      id: '2',
      name: 'View Dashboard',
      code: 'dashboard.view',
      description: 'Can view dashboard',
      resource: 'dashboard',
      action: 'view',
      type: 'menu'
    }
  ]
}

// Add admin and regular users to the beginning of the array
mockUsers.unshift(adminUser, regularUser)
