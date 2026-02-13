import type { SysConfig } from '@/types/config'

export const sysConfigs: SysConfig[] = [
  // 基础配置
  { id: '1', name: '站点名称', key: 'site.name', value: 'Antdv Next Admin', valueType: 'string', group: '基础配置', description: '系统显示名称', builtIn: true, sort: 1, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '2', name: '站点描述', key: 'site.description', value: '基于 Vue3 + Ant Design Vue 的后台管理系统', valueType: 'string', group: '基础配置', description: '站点SEO描述', builtIn: true, sort: 2, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '3', name: '版权信息', key: 'site.copyright', value: '© 2024 Antdv Next Admin', valueType: 'string', group: '基础配置', description: '页脚版权文字', builtIn: false, sort: 3, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '4', name: '系统版本', key: 'site.version', value: '1.0.0', valueType: 'string', group: '基础配置', description: '当前系统版本号', builtIn: true, sort: 4, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },

  // 安全配置
  { id: '10', name: '登录失败锁定次数', key: 'security.maxLoginAttempts', value: '5', valueType: 'number', group: '安全配置', description: '连续登录失败N次后锁定账号', builtIn: true, sort: 1, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '11', name: '账号锁定时长(分钟)', key: 'security.lockDuration', value: '30', valueType: 'number', group: '安全配置', description: '账号锁定后的解锁等待时间', builtIn: true, sort: 2, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '12', name: 'Token有效期(小时)', key: 'security.tokenExpiry', value: '24', valueType: 'number', group: '安全配置', description: '登录Token的有效时长', builtIn: true, sort: 3, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '13', name: '启用验证码', key: 'security.captchaEnabled', value: 'true', valueType: 'boolean', group: '安全配置', description: '登录时是否需要验证码', builtIn: false, sort: 4, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '14', name: '密码最小长度', key: 'security.minPasswordLength', value: '6', valueType: 'number', group: '安全配置', description: '用户密码最小字符数', builtIn: true, sort: 5, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },

  // 上传配置
  { id: '20', name: '文件上传大小限制(MB)', key: 'upload.maxSize', value: '10', valueType: 'number', group: '上传配置', description: '单个文件最大上传大小', builtIn: true, sort: 1, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '21', name: '允许上传类型', key: 'upload.allowedTypes', value: 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,zip', valueType: 'string', group: '上传配置', description: '允许上传的文件扩展名，逗号分隔', builtIn: true, sort: 2, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '22', name: '图片压缩质量', key: 'upload.imageQuality', value: '80', valueType: 'number', group: '上传配置', description: '上传图片自动压缩质量(0-100)', builtIn: false, sort: 3, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },

  // 通知配置
  { id: '30', name: '启用邮件通知', key: 'notify.emailEnabled', value: 'true', valueType: 'boolean', group: '通知配置', description: '是否启用邮件通知功能', builtIn: false, sort: 1, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '31', name: 'SMTP服务器', key: 'notify.smtpHost', value: 'smtp.example.com', valueType: 'string', group: '通知配置', description: '邮件发送SMTP服务器地址', builtIn: false, sort: 2, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '32', name: 'SMTP端口', key: 'notify.smtpPort', value: '465', valueType: 'number', group: '通知配置', description: 'SMTP服务器端口', builtIn: false, sort: 3, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '33', name: '发件人邮箱', key: 'notify.senderEmail', value: 'noreply@example.com', valueType: 'string', group: '通知配置', description: '系统通知发件人邮箱地址', builtIn: false, sort: 4, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
]
