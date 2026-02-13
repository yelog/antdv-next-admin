import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { Department, DeptQueryParams } from '@/types/dept'

/**
 * 获取部门树
 */
export function getDeptTree(params?: DeptQueryParams) {
  return request.get<ApiResponse<Department[]>>('/dept/tree', { params })
}

/**
 * 获取部门列表（扁平）
 */
export function getDeptList(params?: DeptQueryParams) {
  return request.get<ApiResponse<Department[]>>('/dept/list', { params })
}

/**
 * 创建部门
 */
export function createDept(data: Partial<Department>) {
  return request.post<ApiResponse<Department>>('/dept', data)
}

/**
 * 更新部门
 */
export function updateDept(id: string, data: Partial<Department>) {
  return request.put<ApiResponse<Department>>(`/dept/${id}`, data)
}

/**
 * 删除部门
 */
export function deleteDept(id: string) {
  return request.delete<ApiResponse<void>>(`/dept/${id}`)
}
