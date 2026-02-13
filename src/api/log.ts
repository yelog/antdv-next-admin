import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { OperationLog, LoginLog, OperationLogQueryParams, LoginLogQueryParams } from '@/types/log'

/**
 * 获取操作日志列表
 */
export function getOperationLogList(params: OperationLogQueryParams) {
  return request.get<ApiResponse<{
    list: OperationLog[]
    total: number
    page: number
    pageSize: number
  }>>('/log/operation/list', { params })
}

/**
 * 获取登录日志列表
 */
export function getLoginLogList(params: LoginLogQueryParams) {
  return request.get<ApiResponse<{
    list: LoginLog[]
    total: number
    page: number
    pageSize: number
  }>>('/log/login/list', { params })
}

/**
 * 清空操作日志
 */
export function clearOperationLog() {
  return request.delete<ApiResponse<void>>('/log/operation/clear')
}

/**
 * 清空登录日志
 */
export function clearLoginLog() {
  return request.delete<ApiResponse<void>>('/log/login/clear')
}
