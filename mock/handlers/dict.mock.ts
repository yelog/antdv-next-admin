import { defineMock } from 'vite-plugin-mock-dev-server'
import { dictTypes, dictData } from '../data/dict.data'
import type { DictType, DictData } from '@/types/dict'

export default defineMock([
  // 获取所有字典类型
  {
    url: '/api/dict/types',
    method: 'GET',
    body: () => {
      return {
        code: 200,
        message: 'success',
        data: dictTypes
      }
    }
  },

  // 获取字典类型列表（分页）
  {
    url: '/api/dict/type/list',
    method: 'GET',
    body: (req) => {
      const { name, code, status, page = 1, pageSize = 10 } = req.query

      let filtered = [...dictTypes]

      if (name) {
        filtered = filtered.filter(item => item.name.includes(name as string))
      }
      if (code) {
        filtered = filtered.filter(item => item.code.includes(code as string))
      }
      if (status) {
        filtered = filtered.filter(item => item.status === status)
      }

      const start = (Number(page) - 1) * Number(pageSize)
      const end = start + Number(pageSize)
      const list = filtered.slice(start, end)

      return {
        code: 200,
        message: 'success',
        data: {
          list,
          total: filtered.length,
          page: Number(page),
          pageSize: Number(pageSize)
        }
      }
    }
  },

  // 创建字典类型
  {
    url: '/api/dict/type',
    method: 'POST',
    body: (req) => {
      const newType: DictType = {
        id: String(Date.now()),
        ...req.body,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      dictTypes.push(newType)
      return {
        code: 200,
        message: '创建成功',
        data: newType
      }
    }
  },

  // 更新字典类型
  {
    url: '/api/dict/type/:id',
    method: 'PUT',
    body: (req) => {
      const { id } = req.params
      const index = dictTypes.findIndex(item => item.id === id)
      if (index !== -1) {
        dictTypes[index] = {
          ...dictTypes[index],
          ...req.body,
          updateTime: new Date().toISOString()
        }
        return {
          code: 200,
          message: '更新成功',
          data: dictTypes[index]
        }
      }
      return {
        code: 404,
        message: '字典类型不存在'
      }
    }
  },

  // 删除字典类型
  {
    url: '/api/dict/type/:id',
    method: 'DELETE',
    body: (req) => {
      const { id } = req.params
      const index = dictTypes.findIndex(item => item.id === id)
      if (index !== -1) {
        dictTypes.splice(index, 1)
        return {
          code: 200,
          message: '删除成功'
        }
      }
      return {
        code: 404,
        message: '字典类型不存在'
      }
    }
  },

  // 获取所有字典数据
  {
    url: '/api/dict/data/all',
    method: 'GET',
    body: () => {
      return {
        code: 200,
        message: 'success',
        data: dictData
      }
    }
  },

  // 获取字典数据列表（分页） - 必须在 :typeCode 之前，避免被参数路由匹配
  {
    url: '/api/dict/data/list',
    method: 'GET',
    body: (req) => {
      const { typeCode, label, value, status, page = 1, pageSize = 10 } = req.query

      let filtered = [...dictData]

      if (typeCode) {
        filtered = filtered.filter(item => item.typeCode === typeCode)
      }
      if (label) {
        filtered = filtered.filter(item => item.label.includes(label as string))
      }
      if (value) {
        filtered = filtered.filter(item => item.value.includes(value as string))
      }
      if (status) {
        filtered = filtered.filter(item => item.status === status)
      }

      const start = (Number(page) - 1) * Number(pageSize)
      const end = start + Number(pageSize)
      const list = filtered.slice(start, end)

      return {
        code: 200,
        message: 'success',
        data: {
          list,
          total: filtered.length,
          page: Number(page),
          pageSize: Number(pageSize)
        }
      }
    }
  },

  // 根据类型获取字典数据
  {
    url: '/api/dict/data/:typeCode',
    method: 'GET',
    body: (req) => {
      const { typeCode } = req.params
      const filtered = dictData.filter(item => item.typeCode === typeCode && item.status === 'enabled')
      return {
        code: 200,
        message: 'success',
        data: filtered
      }
    }
  },

  // 创建字典数据
  {
    url: '/api/dict/data',
    method: 'POST',
    body: (req) => {
      const newData: DictData = {
        id: String(Date.now()),
        ...req.body,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      dictData.push(newData)
      return {
        code: 200,
        message: '创建成功',
        data: newData
      }
    }
  },

  // 更新字典数据
  {
    url: '/api/dict/data/:id',
    method: 'PUT',
    body: (req) => {
      const { id } = req.params
      const index = dictData.findIndex(item => item.id === id)
      if (index !== -1) {
        dictData[index] = {
          ...dictData[index],
          ...req.body,
          updateTime: new Date().toISOString()
        }
        return {
          code: 200,
          message: '更新成功',
          data: dictData[index]
        }
      }
      return {
        code: 404,
        message: '字典数据不存在'
      }
    }
  },

  // 删除字典数据
  {
    url: '/api/dict/data/:id',
    method: 'DELETE',
    body: (req) => {
      const { id } = req.params
      const index = dictData.findIndex(item => item.id === id)
      if (index !== -1) {
        dictData.splice(index, 1)
        return {
          code: 200,
          message: '删除成功'
        }
      }
      return {
        code: 404,
        message: '字典数据不存在'
      }
    }
  }
])
