import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { SysFile, SysFileQueryParams } from '@/types/file'

export async function getFileList(params: SysFileQueryParams): Promise<ApiResponse<{
  list: SysFile[]
  total: number
  page: number
  pageSize: number
}>> {
  return request.get('/file/list', { params })
}

export async function deleteFile(id: string): Promise<ApiResponse<void>> {
  return request.delete(`/file/${id}`)
}