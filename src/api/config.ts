import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { SysConfig, SysConfigQueryParams } from '@/types/config'

const isMock = import.meta.env.VITE_USE_MOCK === 'true'

const ok = <T>(data: T, message = 'success'): ApiResponse<T> => ({
  code: 200,
  message,
  data,
  success: true
})

const error = (code: number, message: string): ApiResponse<any> => ({
  code,
  message,
  data: null,
  success: false
})

export async function getConfigList(params: SysConfigQueryParams): Promise<ApiResponse<{
  list: SysConfig[]
  total: number
  page: number
  pageSize: number
}>> {
  if (!isMock) return request.get('/config/list', { params })

  const { sysConfigs } = await import('../../mock/data/config.data')
  const { page = 1, pageSize = 10, key, group } = params
  let filtered = [...sysConfigs]

  if (key) filtered = filtered.filter(item => item.key.includes(key))
  if (group) filtered = filtered.filter(item => item.group === group)

  filtered.sort((a, b) => a.sort - b.sort)

  const start = (page - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)

  return ok({ list, total: filtered.length, page, pageSize })
}

export async function getConfigByKey(key: string): Promise<ApiResponse<SysConfig>> {
  if (!isMock) return request.get(`/config/key/${key}`)

  const { sysConfigs } = await import('../../mock/data/config.data')
  const config = sysConfigs.find(item => item.key === key)
  if (!config) return error(404, '配置不存在')
  return ok(config)
}

export async function createConfig(data: Partial<SysConfig>): Promise<ApiResponse<SysConfig>> {
  if (!isMock) return request.post('/config', data)

  const { sysConfigs } = await import('../../mock/data/config.data')
  const newConfig: SysConfig = {
    id: String(Date.now()),
    name: data.name || '',
    key: data.key || '',
    value: data.value || '',
    valueType: data.valueType || 'string',
    group: data.group || 'basic',
    description: data.description,
    builtIn: false,
    sort: data.sort || 99,
    createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  sysConfigs.push(newConfig)
  return ok(newConfig, '创建成功')
}

export async function updateConfig(id: string, data: Partial<SysConfig>): Promise<ApiResponse<SysConfig>> {
  if (!isMock) return request.put(`/config/${id}`, data)

  const { sysConfigs } = await import('../../mock/data/config.data')
  const index = sysConfigs.findIndex(item => item.id === id)
  if (index === -1) return error(404, '配置不存在')

  sysConfigs[index] = {
    ...sysConfigs[index],
    ...data,
    updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  return ok(sysConfigs[index], '更新成功')
}

export async function deleteConfig(id: string): Promise<ApiResponse<void>> {
  if (!isMock) return request.delete(`/config/${id}`)

  const { sysConfigs } = await import('../../mock/data/config.data')
  const index = sysConfigs.findIndex(item => item.id === id)
  if (index === -1) return error(404, '配置不存在')

  const config = sysConfigs[index]
  if (config.builtIn) return error(400, '内置配置不可删除')

  sysConfigs.splice(index, 1)
  return ok(undefined as any, '删除成功')
}
