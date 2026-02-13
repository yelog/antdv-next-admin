import { defineMock } from 'vite-plugin-mock-dev-server'
import { departments, buildDeptTree } from '../data/dept.data'
import type { Department } from '@/types/dept'

export default defineMock([
  // 获取部门树
  {
    url: '/api/dept/tree',
    method: 'GET',
    body: (req) => {
      const { name, status } = req.query
      let filtered = [...departments]

      if (name) {
        filtered = filtered.filter(item => item.name.includes(name as string))
      }
      if (status) {
        filtered = filtered.filter(item => item.status === status)
      }

      return {
        code: 200,
        message: 'success',
        data: buildDeptTree(filtered)
      }
    }
  },

  // 获取部门列表（扁平）
  {
    url: '/api/dept/list',
    method: 'GET',
    body: (req) => {
      const { name, status } = req.query
      let filtered = [...departments]

      if (name) {
        filtered = filtered.filter(item => item.name.includes(name as string))
      }
      if (status) {
        filtered = filtered.filter(item => item.status === status)
      }

      filtered.sort((a, b) => a.sort - b.sort)

      return {
        code: 200,
        message: 'success',
        data: filtered
      }
    }
  },

  // 创建部门
  {
    url: '/api/dept',
    method: 'POST',
    body: (req) => {
      const newDept: Department = {
        id: String(Date.now()),
        ...req.body,
        createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      departments.push(newDept)
      return { code: 200, message: '创建成功', data: newDept }
    }
  },

  // 更新部门
  {
    url: '/api/dept/:id',
    method: 'PUT',
    body: (req) => {
      const { id } = req.params
      const index = departments.findIndex(item => item.id === id)
      if (index !== -1) {
        departments[index] = {
          ...departments[index],
          ...req.body,
          updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
        }
        return { code: 200, message: '更新成功', data: departments[index] }
      }
      return { code: 404, message: '部门不存在' }
    }
  },

  // 删除部门
  {
    url: '/api/dept/:id',
    method: 'DELETE',
    body: (req) => {
      const { id } = req.params
      // 检查是否有子部门
      const hasChildren = departments.some(item => item.parentId === id)
      if (hasChildren) {
        return { code: 400, message: '存在子部门，无法删除' }
      }
      const index = departments.findIndex(item => item.id === id)
      if (index !== -1) {
        departments.splice(index, 1)
        return { code: 200, message: '删除成功' }
      }
      return { code: 404, message: '部门不存在' }
    }
  }
])
