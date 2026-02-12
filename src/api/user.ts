import { request } from '@/utils/request'
import type { User } from '@/types/auth'
import type { ApiResponse, PageParams, PageResult } from '@/types/api'

const isMock = import.meta.env.VITE_USE_MOCK === 'true'

const ok = <T>(data: T, message = 'Success'): ApiResponse<T> => ({
  code: 200,
  message,
  data,
  success: true
})

const notFound = (message = 'Not found'): ApiResponse<any> => ({
  code: 404,
  message,
  data: null,
  success: false
})

/**
 * Get user list
 */
export async function getUserList(params: PageParams): Promise<ApiResponse<PageResult<User>>> {
  if (!isMock) return request.get('/users', { params })

  const { mockUsers } = await import('../../mock/data/users.data')

  const { current = 1, pageSize = 10, username, email, status } = (params || {}) as any

  let filtered = [...mockUsers]
  if (username) filtered = filtered.filter((u) => u.username?.toLowerCase().includes(String(username).toLowerCase()))
  if (email) filtered = filtered.filter((u) => u.email?.toLowerCase().includes(String(email).toLowerCase()))
  if (status) filtered = filtered.filter((u) => u.status === status)

  const cur = Number(current) || 1
  const size = Number(pageSize) || 10
  const start = (cur - 1) * size
  const list = filtered.slice(start, start + size)

  return ok({
    list,
    total: filtered.length,
    current: cur,
    pageSize: size
  })
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<ApiResponse<User>> {
  if (!isMock) return request.get(`/users/${id}`)

  const { mockUsers, adminUser } = await import('../../mock/data/users.data')
  const user = (id === '1' ? adminUser : mockUsers.find((u) => u.id === id)) as User | undefined
  if (!user) return notFound('User not found')
  return ok(user)
}

/**
 * Create user
 */
export async function createUser(data: Partial<User>): Promise<ApiResponse<User>> {
  if (!isMock) return request.post('/users', data)

  const { mockUsers } = await import('../../mock/data/users.data')
  const { faker } = await import('@faker-js/faker')

  const now = new Date().toISOString()
  const newUser: User = {
    id: faker.string.uuid(),
    username: data.username || faker.internet.userName(),
    email: data.email || faker.internet.email(),
    realName: data.realName || faker.person.fullName(),
    avatar: data.avatar || faker.image.avatar(),
    phone: data.phone || `1${faker.string.numeric(10)}`,
    gender: (data.gender as any) || 'male',
    birthDate: data.birthDate || '1990-01-01',
    bio: data.bio || '',
    status: (data.status as any) || 'active',
    createdAt: now,
    updatedAt: now,
    roles: data.roles || [],
    permissions: data.permissions || []
  }

  mockUsers.unshift(newUser)
  return ok(newUser, 'User created successfully')
}

/**
 * Update user
 */
export async function updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
  if (!isMock) return request.put(`/users/${id}`, data)

  const { mockUsers, adminUser } = await import('../../mock/data/users.data')
  const now = new Date().toISOString()

  if (id === '1') {
    Object.assign(adminUser, data, { updatedAt: now })
    return ok(adminUser, 'User updated successfully')
  }

  const idx = mockUsers.findIndex((u) => u.id === id)
  if (idx === -1) return notFound('User not found')

  mockUsers[idx] = { ...mockUsers[idx], ...data, updatedAt: now } as User
  return ok(mockUsers[idx], 'User updated successfully')
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<ApiResponse<null>> {
  if (!isMock) return request.delete(`/users/${id}`)

  if (id === '1') return { code: 400, message: 'Cannot delete admin user', data: null, success: false }

  const { mockUsers } = await import('../../mock/data/users.data')
  const idx = mockUsers.findIndex((u) => u.id === id)
  if (idx === -1) return notFound('User not found')

  mockUsers.splice(idx, 1)
  return ok(null, 'User deleted successfully')
}
