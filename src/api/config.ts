import type { ApiResponse } from '@/types/api'
import type { SysConfig, SysConfigQueryParams } from '@/types/config'
import { request } from '@/utils/request'

export async function getConfigList(params: SysConfigQueryParams): Promise<ApiResponse<{
  list: SysConfig[]
  total: number
  page: number
  pageSize: number
}>> {
  return request.get('/config/list', { params })
}

export async function getConfigByKey(key: string): Promise<ApiResponse<SysConfig>> {
  return request.get(`/config/key/${key}`)
}

export async function createConfig(data: Partial<SysConfig>): Promise<ApiResponse<SysConfig>> {
  return request.post('/config', data)
}

export async function updateConfig(id: string, data: Partial<SysConfig>): Promise<ApiResponse<SysConfig>> {
  return request.put(`/config/${id}`, data)
}

export async function deleteConfig(id: string): Promise<ApiResponse<void>> {
  return request.delete(`/config/${id}`)
}
