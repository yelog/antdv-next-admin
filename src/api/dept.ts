import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { Department, DeptQueryParams } from '@/types/dept'

/**
 * 获取部门树
 */
export async function getDeptTree(params?: DeptQueryParams): Promise<ApiResponse<Department[]>> {
  return request.get('/dept/tree', { params })
}

/**
 * 获取部门列表（扁平）
 */
export async function getDeptList(params?: DeptQueryParams): Promise<ApiResponse<Department[]>> {
  return request.get('/dept/list', { params })
}

/**
 * 创建部门
 */
export async function createDept(data: Partial<Department>): Promise<ApiResponse<Department>> {
  return request.post('/dept', data)
}

/**
 * 更新部门
 */
export async function updateDept(id: string, data: Partial<Department>): Promise<ApiResponse<Department>> {
  return request.put(`/dept/${id}`, data)
}

/**
 * 删除部门
 */
export async function deleteDept(id: string): Promise<ApiResponse<void>> {
  return request.delete(`/dept/${id}`)
}