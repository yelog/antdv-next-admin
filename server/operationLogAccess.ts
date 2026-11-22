import type { ApiResponse } from '../src/types/api';

export interface OperationLogPrincipal {
  permissions: readonly string[];
}

export function operationLogAccessError(
  principal: OperationLogPrincipal | null,
): ApiResponse<null> | null {
  if (!principal) {
    return { code: 401, message: 'Unauthorized', success: false, data: null };
  }

  const { permissions } = principal;
  if (!permissions.includes('*') && !permissions.includes('system.log.view')) {
    return { code: 403, message: 'Forbidden', success: false, data: null };
  }

  return null;
}
