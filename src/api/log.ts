import type { ApiResponse } from '@/types/api';
import type {
  OperationLog,
  LoginLog,
  OperationLogQueryParams,
  LoginLogQueryParams,
} from '@/types/log';

import { readLogFilterResult, type LogFilterResult } from '@/utils/logFilterIntent';
import { request } from '@/utils/request';

export async function proposeOperationLogFilters(
  prompt: string,
  locale: string,
  signal: AbortSignal,
): Promise<LogFilterResult> {
  const response = await request.post<ApiResponse<unknown>>(
    '/log/operation/filter-intent',
    { prompt, locale },
    { signal, skipErrorMessage: true },
  );
  const result = readLogFilterResult(response.data);
  if (!result) throw new Error('Invalid operation log filter response');
  return result;
}

/**
 * 获取操作日志列表
 */
export function getOperationLogList(params: OperationLogQueryParams): Promise<
  ApiResponse<{
    list: OperationLog[];
    total: number;
    page: number;
    pageSize: number;
  }>
> {
  return request.get('/log/operation/list', { params });
}

/**
 * 获取登录日志列表
 */
export function getLoginLogList(params: LoginLogQueryParams): Promise<
  ApiResponse<{
    list: LoginLog[];
    total: number;
    page: number;
    pageSize: number;
  }>
> {
  return request.get('/log/login/list', { params });
}

/**
 * 清空操作日志
 */
export function clearOperationLog(): Promise<ApiResponse<void>> {
  return request.delete('/log/operation/clear');
}

/**
 * 清空登录日志
 */
export function clearLoginLog(): Promise<ApiResponse<void>> {
  return request.delete('/log/login/clear');
}
