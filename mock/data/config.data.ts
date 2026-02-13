import type { SysConfig } from '@/types/config'

export const sysConfigs: SysConfig[] = [
  // basic
  { id: '1', name: 'Site Name', key: 'site.name', value: 'Antdv Next Admin', valueType: 'string', group: 'basic', description: 'System display name', builtIn: true, sort: 1, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '2', name: 'Site Description', key: 'site.description', value: 'Vue3 + Ant Design Vue Admin System', valueType: 'string', group: 'basic', description: 'Site SEO description', builtIn: true, sort: 2, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '3', name: 'Copyright', key: 'site.copyright', value: '© 2024 Antdv Next Admin', valueType: 'string', group: 'basic', description: 'Footer copyright text', builtIn: false, sort: 3, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '4', name: 'System Version', key: 'site.version', value: '1.0.0', valueType: 'string', group: 'basic', description: 'Current system version', builtIn: true, sort: 4, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },

  // security
  { id: '10', name: 'Max Login Attempts', key: 'security.maxLoginAttempts', value: '5', valueType: 'number', group: 'security', description: 'Lock account after N failed login attempts', builtIn: true, sort: 1, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '11', name: 'Lock Duration (min)', key: 'security.lockDuration', value: '30', valueType: 'number', group: 'security', description: 'Account lock duration in minutes', builtIn: true, sort: 2, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '12', name: 'Token Expiry (hours)', key: 'security.tokenExpiry', value: '24', valueType: 'number', group: 'security', description: 'Login token expiration time', builtIn: true, sort: 3, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '13', name: 'Enable Captcha', key: 'security.captchaEnabled', value: 'true', valueType: 'boolean', group: 'security', description: 'Require captcha for login', builtIn: false, sort: 4, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '14', name: 'Min Password Length', key: 'security.minPasswordLength', value: '6', valueType: 'number', group: 'security', description: 'Minimum password character count', builtIn: true, sort: 5, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },

  // upload
  { id: '20', name: 'Max Upload Size (MB)', key: 'upload.maxSize', value: '10', valueType: 'number', group: 'upload', description: 'Maximum single file upload size', builtIn: true, sort: 1, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '21', name: 'Allowed Upload Types', key: 'upload.allowedTypes', value: 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,zip', valueType: 'string', group: 'upload', description: 'Allowed file extensions, comma separated', builtIn: true, sort: 2, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '22', name: 'Image Compression Quality', key: 'upload.imageQuality', value: '80', valueType: 'number', group: 'upload', description: 'Auto compression quality for uploaded images (0-100)', builtIn: false, sort: 3, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },

  // notification
  { id: '30', name: 'Enable Email Notification', key: 'notify.emailEnabled', value: 'true', valueType: 'boolean', group: 'notification', description: 'Enable email notification feature', builtIn: false, sort: 1, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '31', name: 'SMTP Server', key: 'notify.smtpHost', value: 'smtp.example.com', valueType: 'string', group: 'notification', description: 'SMTP server address for sending emails', builtIn: false, sort: 2, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '32', name: 'SMTP Port', key: 'notify.smtpPort', value: '465', valueType: 'number', group: 'notification', description: 'SMTP server port', builtIn: false, sort: 3, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '33', name: 'Sender Email', key: 'notify.senderEmail', value: 'noreply@example.com', valueType: 'string', group: 'notification', description: 'System notification sender email', builtIn: false, sort: 4, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
]
