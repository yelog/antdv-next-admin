import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { OperationLog, LoginLog, OperationLogQueryParams, LoginLogQueryParams } from '@/types/log'

/**
 * 获取操作日志列表
 */
export async function getOperationLogList(params: OperationLogQueryParams): Promise<ApiResponse<{
  list: OperationLog[]
  total: number
  page: number
  pageSize: number
}>> {
  return request.get('/log/operation/list', { params })
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
  return request.get('/log/login/list', { params })
}

/**
 * 清空操作日志
 */
export async function clearOperationLog(): Promise<ApiResponse<void>> {
  return request.delete('/log/operation/clear')
}

/**
 * 清空登录日志
 */
export async function clearLoginLog(): Promise<ApiResponse<void>> {
  return request.delete('/log/login/clear')
}