import { defineMock } from 'vite-plugin-mock-dev-server'
import { operationLogs, loginLogs } from '../data/log.data'

export default defineMock([
  // 操作日志列表
  {
    url: '/api/log/operation/list',
    method: 'GET',
    body: (req) => {
      const { username, module, action, status, startTime, endTime, page = 1, pageSize = 10 } = req.query

      let filtered = [...operationLogs]

      if (username) {
        filtered = filtered.filter(item => item.username.includes(username as string))
      }
      if (module) {
        filtered = filtered.filter(item => item.module === module)
      }
      if (action) {
        filtered = filtered.filter(item => item.action === action)
      }
      if (status) {
        filtered = filtered.filter(item => item.status === status)
      }
      if (startTime) {
        filtered = filtered.filter(item => item.createTime >= (startTime as string))
      }
      if (endTime) {
        filtered = filtered.filter(item => item.createTime <= (endTime as string))
      }

      const start = (Number(page) - 1) * Number(pageSize)
      const end = start + Number(pageSize)
      const list = filtered.slice(start, end)

      return {
        code: 200,
        message: 'success',
        data: { list, total: filtered.length, page: Number(page), pageSize: Number(pageSize) }
      }
    }
  },

  // 登录日志列表
  {
    url: '/api/log/login/list',
    method: 'GET',
    body: (req) => {
      const { username, ip, status, startTime, endTime, page = 1, pageSize = 10 } = req.query

      let filtered = [...loginLogs]

      if (username) {
        filtered = filtered.filter(item => item.username.includes(username as string))
      }
      if (ip) {
        filtered = filtered.filter(item => item.ip.includes(ip as string))
      }
      if (status) {
        filtered = filtered.filter(item => item.status === status)
      }
      if (startTime) {
        filtered = filtered.filter(item => item.createTime >= (startTime as string))
      }
      if (endTime) {
        filtered = filtered.filter(item => item.createTime <= (endTime as string))
      }

      const start = (Number(page) - 1) * Number(pageSize)
      const end = start + Number(pageSize)
      const list = filtered.slice(start, end)

      return {
        code: 200,
        message: 'success',
        data: { list, total: filtered.length, page: Number(page), pageSize: Number(pageSize) }
      }
    }
  },

  // 清空操作日志
  {
    url: '/api/log/operation/clear',
    method: 'DELETE',
    body: () => {
      operationLogs.length = 0
      return { code: 200, message: '清空成功' }
    }
  },

  // 清空登录日志
  {
    url: '/api/log/login/clear',
    method: 'DELETE',
    body: () => {
      loginLogs.length = 0
      return { code: 200, message: '清空成功' }
    }
  }
])
