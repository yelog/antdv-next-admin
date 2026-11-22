import type { OperationLogPrincipal } from '../server/operationLogAccess';
import type { User } from '../src/types/auth';

export function readMockLogPrincipal(
  headers: unknown,
  users: readonly Pick<User, 'id' | 'permissions'>[],
): OperationLogPrincipal | null {
  if (!headers || typeof headers !== 'object') return null;

  const authorization = Object.entries(headers).find(
    ([name]) => name.toLowerCase() === 'authorization',
  )?.[1];
  if (typeof authorization !== 'string') return null;

  const match = /^Bearer mock-token-(\d+)-\d+$/i.exec(authorization);
  if (!match) return null;

  const user = users.find(({ id }) => id === match[1]);
  return user ? { permissions: user.permissions.map(({ code }) => code) } : null;
}
