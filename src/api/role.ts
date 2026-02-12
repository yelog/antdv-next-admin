import { request } from '@/utils/request'
import type { Role } from '@/types/auth'
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
 * Get role list
 */
export async function getRoleList(params: PageParams): Promise<ApiResponse<PageResult<Role>>> {
  if (!isMock) return request.get('/roles', { params })

  const { mockRoles } = await import('../../mock/data/roles.data')
  const { current = 1, pageSize = 10, name, code } = (params || {}) as any

  let filtered = [...mockRoles]
  if (name) filtered = filtered.filter((r) => r.name?.toLowerCase().includes(String(name).toLowerCase()))
  if (code) filtered = filtered.filter((r) => r.code?.toLowerCase().includes(String(code).toLowerCase()))

  const cur = Number(current) || 1
  const size = Number(pageSize) || 10
  const start = (cur - 1) * size
  const list = filtered.slice(start, start + size)

  return ok({ list, total: filtered.length, current: cur, pageSize: size })
}

/**
 * Get role by ID
 */
export async function getRoleById(id: string): Promise<ApiResponse<Role>> {
  if (!isMock) return request.get(`/roles/${id}`)

  const { mockRoles } = await import('../../mock/data/roles.data')
  const role = mockRoles.find((r) => r.id === id)
  if (!role) return notFound('Role not found')
  return ok(role)
}

/**
 * Create role
 */
export async function createRole(data: Partial<Role>): Promise<ApiResponse<Role>> {
  if (!isMock) return request.post('/roles', data)

  const { mockRoles } = await import('../../mock/data/roles.data')
  const now = new Date().toISOString()
  const newRole: Role = {
    id: String(Date.now()),
    name: data.name || 'New Role',
    code: data.code || `role_${Date.now()}`,
    description: data.description || '',
    permissions: data.permissions || [],
    createdAt: now,
    updatedAt: now
  }

  mockRoles.unshift(newRole)
  return ok(newRole, 'Role created successfully')
}

/**
 * Update role
 */
export async function updateRole(id: string, data: Partial<Role>): Promise<ApiResponse<Role>> {
  if (!isMock) return request.put(`/roles/${id}`, data)

  const { mockRoles } = await import('../../mock/data/roles.data')
  const idx = mockRoles.findIndex((r) => r.id === id)
  if (idx === -1) return notFound('Role not found')

  mockRoles[idx] = { ...mockRoles[idx], ...data, updatedAt: new Date().toISOString() } as Role
  return ok(mockRoles[idx], 'Role updated successfully')
}

/**
 * Delete role
 */
export async function deleteRole(id: string): Promise<ApiResponse<null>> {
  if (!isMock) return request.delete(`/roles/${id}`)

  const { mockRoles } = await import('../../mock/data/roles.data')
  const idx = mockRoles.findIndex((r) => r.id === id)
  if (idx === -1) return notFound('Role not found')

  mockRoles.splice(idx, 1)
  return ok(null, 'Role deleted successfully')
}
