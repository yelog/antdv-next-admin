import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { SysConfig, SysConfigQueryParams } from '@/types/config'

export function getConfigList(params: SysConfigQueryParams) {
  return request.get<ApiResponse<{
    list: SysConfig[]
    total: number
    page: number
    pageSize: number
  }>>('/config/list', { params })
}

export function getConfigByKey(key: string) {
  return request.get<ApiResponse<SysConfig>>(`/config/key/${key}`)
}

export function createConfig(data: Partial<SysConfig>) {
  return request.post<ApiResponse<SysConfig>>('/config', data)
}

export function updateConfig(id: string, data: Partial<SysConfig>) {
  return request.put<ApiResponse<SysConfig>>(`/config/${id}`, data)
}

export function deleteConfig(id: string) {
  return request.delete<ApiResponse<void>>(`/config/${id}`)
}
