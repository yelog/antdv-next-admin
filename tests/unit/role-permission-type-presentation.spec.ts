import { describe, expect, it } from 'vitest';

import { getPermissionTypePresentation } from '@/views/system/role/permissionTypePresentation';

describe('role permission type presentation', () => {
  it.each([
    ['menu', { color: 'blue', labelKey: 'permission.menu' }],
    ['button', { color: 'green', labelKey: 'permission.button' }],
    ['api', { color: 'purple', labelKey: 'permission.api' }],
  ] as const)('maps %s permissions to a stable tag presentation', (type, expected) => {
    expect(getPermissionTypePresentation(type)).toEqual(expected);
  });

  it('returns null when the permission type is unavailable', () => {
    expect(getPermissionTypePresentation(undefined)).toBeNull();
  });
});
