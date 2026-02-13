import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { Department, DeptQueryParams } from '@/types/dept'

const isMock = import.meta.env.VITE_USE_MOCK === 'true'

const ok = <T>(data: T, message = 'success'): ApiResponse<T> => ({
  code: 200,
  message,
  data,
  success: true
})

const error = (code: number, message: string): ApiResponse<any> => ({
  code,
  message,
  data: null,
  success: false
})

/**
 * 获取部门树
 */
export async function getDeptTree(params?: DeptQueryParams): Promise<ApiResponse<Department[]>> {
  if (!isMock) return request.get('/dept/tree', { params })

  const { departments, buildDeptTree } = await import('../../mock/data/dept.data')
  const { name, status } = params || {}
  let filtered = [...departments]

  if (name) filtered = filtered.filter(item => item.name.includes(name))
  if (status) filtered = filtered.filter(item => item.status === status)

  return ok(buildDeptTree(filtered))
}

/**
 * 获取部门列表（扁平）
 */
export async function getDeptList(params?: DeptQueryParams): Promise<ApiResponse<Department[]>> {
  if (!isMock) return request.get('/dept/list', { params })

  const { departments } = await import('../../mock/data/dept.data')
  const { name, status } = params || {}
  let filtered = [...departments]

  if (name) filtered = filtered.filter(item => item.name.includes(name))
  if (status) filtered = filtered.filter(item => item.status === status)

  filtered.sort((a, b) => a.sort - b.sort)
  return ok(filtered)
}

/**
 * 创建部门
 */
export async function createDept(data: Partial<Department>): Promise<ApiResponse<Department>> {
  if (!isMock) return request.post('/dept', data)

  const { departments } = await import('../../mock/data/dept.data')
  const newDept: Department = {
    id: String(Date.now()),
    name: data.name || '',
    parentId: data.parentId || null,
    leader: data.leader,
    phone: data.phone,
    email: data.email,
    sort: data.sort || 0,
    status: data.status || 'enabled',
    remark: data.remark,
    createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  departments.push(newDept)
  return ok(newDept, '创建成功')
}

/**
 * 更新部门
 */
export async function updateDept(id: string, data: Partial<Department>): Promise<ApiResponse<Department>> {
  if (!isMock) return request.put(`/dept/${id}`, data)

  const { departments } = await import('../../mock/data/dept.data')
  const index = departments.findIndex(item => item.id === id)
  if (index === -1) return error(404, '部门不存在')

  departments[index] = {
    ...departments[index],
    ...data,
    updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  return ok(departments[index], '更新成功')
}

/**
 * 删除部门
 */
export async function deleteDept(id: string): Promise<ApiResponse<void>> {
  if (!isMock) return request.delete(`/dept/${id}`)

  const { departments } = await import('../../mock/data/dept.data')
  const hasChildren = departments.some(item => item.parentId === id)
  if (hasChildren) return error(400, '存在子部门，无法删除')

  const index = departments.findIndex(item => item.id === id)
  if (index === -1) return error(404, '部门不存在')

  departments.splice(index, 1)
  return ok(undefined as any, '删除成功')
}
