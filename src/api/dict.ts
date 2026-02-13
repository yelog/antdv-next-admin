import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { DictType, DictData, DictQueryParams, DictTypeQueryParams } from '@/types/dict'

/**
 * 获取所有字典类型
 */
export function getDictTypes() {
  return request.get<ApiResponse<DictType[]>>('/dict/types')
}

/**
 * 获取字典类型列表（分页）
 */
export function getDictTypeList(params: DictTypeQueryParams) {
  return request.get<ApiResponse<{
    list: DictType[]
    total: number
    page: number
    pageSize: number
  }>>('/dict/type/list', { params })
}

/**
 * 创建字典类型
 */
export function createDictType(data: Partial<DictType>) {
  return request.post<ApiResponse<DictType>>('/dict/type', data)
}

/**
 * 更新字典类型
 */
export function updateDictType(id: string, data: Partial<DictType>) {
  return request.put<ApiResponse<DictType>>(`/dict/type/${id}`, data)
}

/**
 * 删除字典类型
 */
export function deleteDictType(id: string) {
  return request.delete<ApiResponse<void>>(`/dict/type/${id}`)
}

/**
 * 获取所有字典数据
 */
export function getAllDictData() {
  return request.get<ApiResponse<DictData[]>>('/dict/data/all')
}

/**
 * 根据类型获取字典数据
 */
export function getDictDataByType(typeCode: string) {
  return request.get<ApiResponse<DictData[]>>(`/dict/data/${typeCode}`)
}

/**
 * 获取字典数据列表（分页）
 */
export function getDictDataList(params: DictQueryParams) {
  return request.get<ApiResponse<{
    list: DictData[]
    total: number
    page: number
    pageSize: number
  }>>('/dict/data/list', { params })
}

/**
 * 创建字典数据
 */
export function createDictData(data: Partial<DictData>) {
  return request.post<ApiResponse<DictData>>('/dict/data', data)
}

/**
 * 更新字典数据
 */
export function updateDictData(id: string, data: Partial<DictData>) {
  return request.put<ApiResponse<DictData>>(`/dict/data/${id}`, data)
}

/**
 * 删除字典数据
 */
export function deleteDictData(id: string) {
  return request.delete<ApiResponse<void>>(`/dict/data/${id}`)
}
