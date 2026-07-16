import type { Permission, Role } from '@/types/auth';

import { mockPermissions } from './permissions.data';

function flattenPermissions(nodes: Permission[]): Permission[] {
  return nodes.flatMap((node) => [node, ...flattenPermissions(node.children ?? [])]);
}

function clonePermissions(predicate: (permission: Permission) => boolean): Permission[] {
  return flattenPermissions(mockPermissions)
    .filter(predicate)
    .map((permission) => structuredClone(permission));
}

const adminPermissions = clonePermissions(() => true);
const managerPermissions = clonePermissions(
  ({ code }) =>
    code === 'dashboard.view' ||
    code === 'organization.menu' ||
    code.startsWith('system.dept.') ||
    code.startsWith('system.user.') ||
    code === 'system.role.view',
);
const userPermissions = clonePermissions(({ code }) =>
  ['dashboard.view', 'organization.menu', 'system.user.view'].includes(code),
);
const guestPermissions = clonePermissions(({ code }) => code === 'dashboard.view');

export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Administrator',
    code: 'admin',
    description: 'System administrator with full access',
    permissions: adminPermissions,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Manager',
    code: 'manager',
    description: 'Department manager with management permissions',
    permissions: managerPermissions,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'User',
    code: 'user',
    description: 'Regular user with basic permissions',
    permissions: userPermissions,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '4',
    name: 'Guest',
    code: 'guest',
    description: 'Guest user with read-only access',
    permissions: guestPermissions,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
];
