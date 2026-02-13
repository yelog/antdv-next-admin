import { defineMock } from 'vite-plugin-mock-dev-server'
import { sysConfigs } from '../data/config.data'
import type { SysConfig } from '@/types/config'

export default defineMock([
  {
    url: '/api/config/list',
    method: 'GET',
    body: (req) => {
      const { name, key, group, page = 1, pageSize = 20 } = req.query
      let filtered = [...sysConfigs]

      if (name) filtered = filtered.filter(item => item.name.includes(name as string))
      if (key) filtered = filtered.filter(item => item.key.includes(key as string))
      if (group) filtered = filtered.filter(item => item.group === group)

      filtered.sort((a, b) => a.sort - b.sort)
      const start = (Number(page) - 1) * Number(pageSize)
      const list = filtered.slice(start, start + Number(pageSize))

      return { code: 200, message: 'success', data: { list, total: filtered.length, page: Number(page), pageSize: Number(pageSize) } }
    }
  },

  {
    url: '/api/config/key/:key',
    method: 'GET',
    body: (req) => {
      const item = sysConfigs.find(c => c.key === req.params.key)
      return item
        ? { code: 200, message: 'success', data: item }
        : { code: 404, message: '配置不存在' }
    }
  },

  {
    url: '/api/config',
    method: 'POST',
    body: (req) => {
      const exists = sysConfigs.find(c => c.key === req.body.key)
      if (exists) return { code: 400, message: '配置键已存在' }
      const newConfig: SysConfig = {
        id: String(Date.now()),
        ...req.body,
        builtIn: false,
        createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      sysConfigs.push(newConfig)
      return { code: 200, message: '创建成功', data: newConfig }
    }
  },

  {
    url: '/api/config/:id',
    method: 'PUT',
    body: (req) => {
      const index = sysConfigs.findIndex(item => item.id === req.params.id)
      if (index !== -1) {
        sysConfigs[index] = { ...sysConfigs[index], ...req.body, updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19) }
        return { code: 200, message: '更新成功', data: sysConfigs[index] }
      }
      return { code: 404, message: '配置不存在' }
    }
  },

  {
    url: '/api/config/:id',
    method: 'DELETE',
    body: (req) => {
      const index = sysConfigs.findIndex(item => item.id === req.params.id)
      if (index === -1) return { code: 404, message: '配置不存在' }
      if (sysConfigs[index].builtIn) return { code: 400, message: '内置配置不可删除' }
      sysConfigs.splice(index, 1)
      return { code: 200, message: '删除成功' }
    }
  }
])
