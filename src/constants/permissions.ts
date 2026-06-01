export const ALL_PERMISSION = "*";

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",
  SYSTEM_DEPT_VIEW: "system.dept.view",
  SYSTEM_USER_VIEW: "system.user.view",
  SYSTEM_ROLE_VIEW: "system.role.view",
  SYSTEM_PERMISSION_VIEW: "system.permission.view",
  SYSTEM_CONFIG_VIEW: "system.config.view",
  SYSTEM_DICT_VIEW: "system.dict.view",
  SYSTEM_FILE_VIEW: "system.file.view",
  SYSTEM_LOG_VIEW: "system.log.view",
} as const;

export type PermissionCode =
  | typeof ALL_PERMISSION
  | (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
