import type { Permission } from '@/types/auth';

import { describe, expect, it } from 'vitest';

import { mockPermissions } from '../../mock/data/permissions.data';
import { mockRoles } from '../../mock/data/roles.data';

function flattenPermissions(nodes: Permission[]): Permission[] {
  return nodes.flatMap((node) => [node, ...flattenPermissions(node.children ?? [])]);
}

describe('mock role permissions', () => {
  const rolesByCode = new Map(mockRoles.map((role) => [role.code, role]));
  const allPermissions = flattenPermissions(mockPermissions);

  it('assigns every permission to the administrator', () => {
    expect(rolesByCode.get('admin')?.permissions).toHaveLength(allPermissions.length);
  });

  it('assigns progressively narrower permission sets to non-admin roles', () => {
    const managerCodes = rolesByCode.get('manager')?.permissions.map((item) => item.code) ?? [];
    const userCodes = rolesByCode.get('user')?.permissions.map((item) => item.code) ?? [];
    const guestCodes = rolesByCode.get('guest')?.permissions.map((item) => item.code) ?? [];

    expect(managerCodes).toContain('system.dept.edit');
    expect(managerCodes).toContain('system.role.view');
    expect(managerCodes).not.toContain('system.permission.edit');
    expect(userCodes).toEqual(['dashboard.view', 'organization.menu', 'system.user.view']);
    expect(guestCodes).toEqual(['dashboard.view']);
  });

  it('keeps permission ids unique and does not share source objects', () => {
    for (const role of mockRoles) {
      const ids = role.permissions.map((permission) => permission.id);
      expect(new Set(ids).size).toBe(ids.length);
    }

    const adminDashboard = rolesByCode
      .get('admin')
      ?.permissions.find((permission) => permission.code === 'dashboard.view');
    const sourceDashboard = allPermissions.find(
      (permission) => permission.code === 'dashboard.view',
    );
    expect(adminDashboard).not.toBe(sourceDashboard);
  });
});
