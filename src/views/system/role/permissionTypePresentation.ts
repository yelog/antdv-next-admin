import type { Permission } from '@/types/auth';

type PermissionTypePresentation = {
  color: string;
  labelKey: 'permission.menu' | 'permission.button' | 'permission.api';
};

const PERMISSION_TYPE_PRESENTATIONS = {
  menu: { color: 'blue', labelKey: 'permission.menu' },
  button: { color: 'green', labelKey: 'permission.button' },
  api: { color: 'purple', labelKey: 'permission.api' },
} satisfies Record<Permission['type'], PermissionTypePresentation>;

export function getPermissionTypePresentation(
  type: Permission['type'] | undefined,
): PermissionTypePresentation | null {
  return type ? PERMISSION_TYPE_PRESENTATIONS[type] : null;
}
