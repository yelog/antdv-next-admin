import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { SysFile, SysFileQueryParams } from '@/types/file'

export function getFileList(params: SysFileQueryParams) {
  return request.get<ApiResponse<{
    list: SysFile[]
    total: number
    page: number
    pageSize: number
  }>>('/file/list', { params })
}

export function deleteFile(id: string) {
  return request.delete<ApiResponse<void>>(`/file/${id}`)
}
