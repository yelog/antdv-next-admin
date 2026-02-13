import { defineMock } from 'vite-plugin-mock-dev-server'
import { sysFiles } from '../data/file.data'

export default defineMock([
  {
    url: '/api/file/list',
    method: 'GET',
    body: (req) => {
      const { name, ext, storage, page = 1, pageSize = 20 } = req.query
      let filtered = [...sysFiles]

      if (name) filtered = filtered.filter(item => item.originalName.includes(name as string))
      if (ext) filtered = filtered.filter(item => item.ext === ext)
      if (storage) filtered = filtered.filter(item => item.storage === storage)

      const start = (Number(page) - 1) * Number(pageSize)
      const list = filtered.slice(start, start + Number(pageSize))

      return { code: 200, message: 'success', data: { list, total: filtered.length, page: Number(page), pageSize: Number(pageSize) } }
    }
  },

  {
    url: '/api/file/:id',
    method: 'DELETE',
    body: (req) => {
      const index = sysFiles.findIndex(item => item.id === req.params.id)
      if (index === -1) return { code: 404, message: '文件不存在' }
      sysFiles.splice(index, 1)
      return { code: 200, message: '删除成功' }
    }
  }
])
