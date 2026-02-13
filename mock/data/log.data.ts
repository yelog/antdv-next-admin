import type { OperationLog, LoginLog } from '@/types/log'

const modules = ['用户管理', '角色管理', '菜单管理', '数据字典', '系统登录', '个人中心', '数据看板']
const actions: OperationLog['action'][] = ['login', 'logout', 'create', 'update', 'delete', 'export', 'other']
const methods = ['GET', 'POST', 'PUT', 'DELETE']
const browsers = ['Chrome 120', 'Firefox 121', 'Safari 17', 'Edge 120']
const osList = ['Windows 11', 'macOS 14', 'Ubuntu 22.04', 'iOS 17']
const ips = ['192.168.1.100', '192.168.1.101', '10.0.0.50', '172.16.0.88', '192.168.2.200', '10.10.1.33']
const usernames = ['admin', 'user', 'zhangsan', 'lisi', 'wangwu']

const actionDescMap: Record<string, string[]> = {
  login: ['登录系统'],
  logout: ['退出系统'],
  create: ['新增用户', '新增角色', '新增菜单', '新增字典类型', '新增字典数据'],
  update: ['修改用户信息', '修改角色权限', '修改菜单配置', '修改字典数据', '修改个人资料', '重置用户密码'],
  delete: ['删除用户', '删除角色', '删除菜单', '删除字典数据'],
  export: ['导出用户列表', '导出角色列表', '导出操作日志'],
  other: ['查看数据看板', '刷新缓存']
}

const actionUrlMap: Record<string, string[]> = {
  login: ['/api/auth/login'],
  logout: ['/api/auth/logout'],
  create: ['/api/user', '/api/role', '/api/permission', '/api/dict/type', '/api/dict/data'],
  update: ['/api/user/1', '/api/role/1', '/api/permission/1', '/api/dict/data/1', '/api/profile'],
  delete: ['/api/user/1', '/api/role/1', '/api/permission/1', '/api/dict/data/1'],
  export: ['/api/user/export', '/api/role/export', '/api/log/export'],
  other: ['/api/dashboard/stats', '/api/cache/refresh']
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateTime(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(Math.floor(Math.random() * 14) + 8)
  d.setMinutes(Math.floor(Math.random() * 60))
  d.setSeconds(Math.floor(Math.random() * 60))
  return d.toISOString().replace('T', ' ').slice(0, 19)
}

// 生成操作日志
export const operationLogs: OperationLog[] = []
for (let i = 1; i <= 80; i++) {
  const action = randomItem(actions)
  const descs = actionDescMap[action]
  const urls = actionUrlMap[action]
  const isFail = Math.random() < 0.08
  operationLogs.push({
    id: String(i),
    username: randomItem(usernames),
    module: randomItem(modules),
    action,
    description: randomItem(descs),
    method: action === 'create' ? 'POST' : action === 'update' ? 'PUT' : action === 'delete' ? 'DELETE' : 'GET',
    url: randomItem(urls),
    ip: randomItem(ips),
    browser: randomItem(browsers),
    os: randomItem(osList),
    status: isFail ? 'fail' : 'success',
    errorMsg: isFail ? '操作权限不足' : undefined,
    duration: Math.floor(Math.random() * 500) + 10,
    createTime: generateTime(Math.floor(i / 6))
  })
}
operationLogs.sort((a, b) => b.createTime.localeCompare(a.createTime))

// 生成登录日志
export const loginLogs: LoginLog[] = []
const loginMessages = ['登录成功', '登录成功', '登录成功', '密码错误', '账号已锁定', '验证码错误']
for (let i = 1; i <= 50; i++) {
  const msg = randomItem(loginMessages)
  const isSuccess = msg === '登录成功'
  loginLogs.push({
    id: String(i),
    username: randomItem(usernames),
    ip: randomItem(ips),
    browser: randomItem(browsers),
    os: randomItem(osList),
    status: isSuccess ? 'success' : 'fail',
    message: msg,
    createTime: generateTime(Math.floor(i / 4))
  })
}
loginLogs.sort((a, b) => b.createTime.localeCompare(a.createTime))
