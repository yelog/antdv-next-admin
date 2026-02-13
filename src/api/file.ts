import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { SysFile, SysFileQueryParams } from '@/types/file'

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

export async function getFileList(params: SysFileQueryParams): Promise<ApiResponse<{
  list: SysFile[]
  total: number
  page: number
  pageSize: number
}>> {
  if (!isMock) return request.get('/file/list', { params })

  const { sysFiles } = await import('../../mock/data/file.data')
  const { page = 1, pageSize = 10, name, ext, storage } = params
  let filtered = [...sysFiles]

  if (name) filtered = filtered.filter(f => f.originalName.toLowerCase().includes(name.toLowerCase()))
  if (ext) filtered = filtered.filter(f => f.ext === ext)
  if (storage) filtered = filtered.filter(f => f.storage === storage)

  const start = (page - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)

  return ok({ list, total: filtered.length, page, pageSize })
}

export async function deleteFile(id: string): Promise<ApiResponse<void>> {
  if (!isMock) return request.delete(`/file/${id}`)

  const { sysFiles } = await import('../../mock/data/file.data')
  const index = sysFiles.findIndex(f => f.id === id)
  if (index === -1) return error(404, '文件不存在')

  sysFiles.splice(index, 1)
  return ok(undefined as any, '删除成功')
}
