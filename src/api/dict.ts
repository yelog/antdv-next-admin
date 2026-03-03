import type { ApiResponse } from '@/types/api'
import type { DictData, DictQueryParams, DictType, DictTypeQueryParams } from '@/types/dict'
import { request } from '@/utils/request'

/**
 * 获取所有字典类型
 */
export async function getDictTypes(): Promise<ApiResponse<DictType[]>> {
  return request.get('/dict/types')
}

/**
 * 获取字典类型列表（分页）
 */
export async function getDictTypeList(params: DictTypeQueryParams): Promise<ApiResponse<{
  list: DictType[]
  total: number
  page: number
  pageSize: number
}>> {
  return request.get('/dict/type/list', { params })
}

/**
 * 创建字典类型
 */
export async function createDictType(data: Partial<DictType>): Promise<ApiResponse<DictType>> {
  return request.post('/dict/type', data)
}

/**
 * 更新字典类型
 */
export async function updateDictType(id: string, data: Partial<DictType>): Promise<ApiResponse<DictType>> {
  return request.put(`/dict/type/${id}`, data)
}

/**
 * 删除字典类型
 */
export async function deleteDictType(id: string): Promise<ApiResponse<void>> {
  return request.delete(`/dict/type/${id}`)
}

/**
 * 获取所有字典数据
 */
export async function getAllDictData(): Promise<ApiResponse<DictData[]>> {
  return request.get('/dict/data/all')
}

/**
 * 根据类型获取字典数据
 */
export async function getDictDataByType(typeCode: string): Promise<ApiResponse<DictData[]>> {
  return request.get(`/dict/data/${typeCode}`)
}

/**
 * 获取字典数据列表（分页）
 */
export async function getDictDataList(params: DictQueryParams): Promise<ApiResponse<{
  list: DictData[]
  total: number
  page: number
  pageSize: number
}>> {
  return request.get('/dict/data/list', { params })
}

/**
 * 创建字典数据
 */
export async function createDictData(data: Partial<DictData>): Promise<ApiResponse<DictData>> {
  return request.post('/dict/data', data)
}

/**
 * 更新字典数据
 */
export async function updateDictData(id: string, data: Partial<DictData>): Promise<ApiResponse<DictData>> {
  return request.put(`/dict/data/${id}`, data)
}

/**
 * 删除字典数据
 */
export async function deleteDictData(id: string): Promise<ApiResponse<void>> {
  return request.delete(`/dict/data/${id}`)
}
