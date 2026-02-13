import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { OperationLog, LoginLog, OperationLogQueryParams, LoginLogQueryParams } from '@/types/log'

const isMock = import.meta.env.VITE_USE_MOCK === 'true'

const ok = <T>(data: T, message = 'success'): ApiResponse<T> => ({
  code: 200,
  message,
  data,
  success: true
})

/**
 * 获取操作日志列表
 */
export async function getOperationLogList(params: OperationLogQueryParams): Promise<ApiResponse<{
  list: OperationLog[]
  total: number
  page: number
  pageSize: number
}>> {
  if (!isMock) return request.get('/log/operation/list', { params })

  const { operationLogs } = await import('../../mock/data/log.data')
  const { page = 1, pageSize = 10, username, module, action, status } = params
  let filtered = [...operationLogs]

  if (username) filtered = filtered.filter(l => l.username.includes(username))
  if (module) filtered = filtered.filter(l => l.module === module)
  if (action) filtered = filtered.filter(l => l.action === action)
  if (status) filtered = filtered.filter(l => l.status === status)

  const start = (page - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)

  return ok({ list, total: filtered.length, page, pageSize })
}

/**
 * 获取登录日志列表
 */
export async function getLoginLogList(params: LoginLogQueryParams): Promise<ApiResponse<{
  list: LoginLog[]
  total: number
  page: number
  pageSize: number
}>> {
  if (!isMock) return request.get('/log/login/list', { params })

  const { loginLogs } = await import('../../mock/data/log.data')
  const { page = 1, pageSize = 10, username, status } = params
  let filtered = [...loginLogs]

  if (username) filtered = filtered.filter(l => l.username.includes(username))
  if (status) filtered = filtered.filter(l => l.status === status)

  const start = (page - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)

  return ok({ list, total: filtered.length, page, pageSize })
}

/**
 * 清空操作日志
 */
export async function clearOperationLog(): Promise<ApiResponse<void>> {
  if (!isMock) return request.delete('/log/operation/clear')

  const { operationLogs } = await import('../../mock/data/log.data')
  operationLogs.splice(0, operationLogs.length)
  return ok(undefined as any, '清空成功')
}

/**
 * 清空登录日志
 */
export async function clearLoginLog(): Promise<ApiResponse<void>> {
  if (!isMock) return request.delete('/log/login/clear')

  const { loginLogs } = await import('../../mock/data/log.data')
  loginLogs.splice(0, loginLogs.length)
  return ok(undefined as any, '清空成功')
}
