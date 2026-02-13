import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { DictType, DictData, DictQueryParams, DictTypeQueryParams } from '@/types/dict'

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

/**
 * 获取所有字典类型
 */
export async function getDictTypes(): Promise<ApiResponse<DictType[]>> {
  if (!isMock) return request.get('/dict/types')

  const { dictTypes } = await import('../../mock/data/dict.data')
  return ok(dictTypes.filter(t => t.status === 'enabled'))
}

/**
 * 获取字典类型列表（分页）
 */
export async function getDictTypeList(params: DictTypeQueryParams): Promise<ApiResponse<{
  list: DictType[]
  total: number
  page: number
  pageSize: number
}>> {
  if (!isMock) return request.get('/dict/type/list', { params })

  const { dictTypes } = await import('../../mock/data/dict.data')
  const { page = 1, pageSize = 10, code, name, status } = params
  let filtered = [...dictTypes]

  if (code) filtered = filtered.filter(item => item.code.includes(code))
  if (name) filtered = filtered.filter(item => item.name.includes(name))
  if (status) filtered = filtered.filter(item => item.status === status)

  const start = (page - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)

  return ok({ list, total: filtered.length, page, pageSize })
}

/**
 * 创建字典类型
 */
export async function createDictType(data: Partial<DictType>): Promise<ApiResponse<DictType>> {
  if (!isMock) return request.post('/dict/type', data)

  const { dictTypes } = await import('../../mock/data/dict.data')
  const newType: DictType = {
    id: String(Date.now()),
    name: data.name || '',
    code: data.code || '',
    description: data.description,
    status: data.status || 'enabled',
    createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  dictTypes.push(newType)
  return ok(newType, '创建成功')
}

/**
 * 更新字典类型
 */
export async function updateDictType(id: string, data: Partial<DictType>): Promise<ApiResponse<DictType>> {
  if (!isMock) return request.put(`/dict/type/${id}`, data)

  const { dictTypes } = await import('../../mock/data/dict.data')
  const index = dictTypes.findIndex(item => item.id === id)
  if (index === -1) return error(404, '字典类型不存在')

  dictTypes[index] = {
    ...dictTypes[index],
    ...data,
    updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  return ok(dictTypes[index], '更新成功')
}

/**
 * 删除字典类型
 */
export async function deleteDictType(id: string): Promise<ApiResponse<void>> {
  if (!isMock) return request.delete(`/dict/type/${id}`)

  const { dictTypes } = await import('../../mock/data/dict.data')
  const index = dictTypes.findIndex(item => item.id === id)
  if (index === -1) return error(404, '字典类型不存在')

  dictTypes.splice(index, 1)
  return ok(undefined as any, '删除成功')
}

/**
 * 获取所有字典数据
 */
export async function getAllDictData(): Promise<ApiResponse<DictData[]>> {
  if (!isMock) return request.get('/dict/data/all')

  const { dictData } = await import('../../mock/data/dict.data')
  return ok(dictData)
}

/**
 * 根据类型获取字典数据
 */
export async function getDictDataByType(typeCode: string): Promise<ApiResponse<DictData[]>> {
  if (!isMock) return request.get(`/dict/data/${typeCode}`)

  const { dictData } = await import('../../mock/data/dict.data')
  const filtered = dictData.filter(d => d.typeCode === typeCode && d.status === 'enabled')
  filtered.sort((a, b) => a.sort - b.sort)
  return ok(filtered)
}

/**
 * 获取字典数据列表（分页）
 */
export async function getDictDataList(params: DictQueryParams): Promise<ApiResponse<{
  list: DictData[]
  total: number
  page: number
  pageSize: number
}>> {
  if (!isMock) return request.get('/dict/data/list', { params })

  const { dictData } = await import('../../mock/data/dict.data')
  const { page = 1, pageSize = 10, typeCode, label, value, status } = params
  let filtered = [...dictData]

  if (typeCode) filtered = filtered.filter(item => item.typeCode === typeCode)
  if (label) filtered = filtered.filter(item => item.label.includes(label))
  if (value) filtered = filtered.filter(item => item.value.includes(value))
  if (status) filtered = filtered.filter(item => item.status === status)

  filtered.sort((a, b) => a.sort - b.sort)

  const start = (page - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)

  return ok({ list, total: filtered.length, page, pageSize })
}

/**
 * 创建字典数据
 */
export async function createDictData(data: Partial<DictData>): Promise<ApiResponse<DictData>> {
  if (!isMock) return request.post('/dict/data', data)

  const { dictData } = await import('../../mock/data/dict.data')
  const newData: DictData = {
    id: String(Date.now()),
    typeCode: data.typeCode || '',
    label: data.label || '',
    value: data.value || '',
    sort: data.sort || 0,
    status: data.status || 'enabled',
    remark: data.remark,
    createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  dictData.push(newData)
  return ok(newData, '创建成功')
}

/**
 * 更新字典数据
 */
export async function updateDictData(id: string, data: Partial<DictData>): Promise<ApiResponse<DictData>> {
  if (!isMock) return request.put(`/dict/data/${id}`, data)

  const { dictData } = await import('../../mock/data/dict.data')
  const index = dictData.findIndex(item => item.id === id)
  if (index === -1) return error(404, '字典数据不存在')

  dictData[index] = {
    ...dictData[index],
    ...data,
    updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  return ok(dictData[index], '更新成功')
}

/**
 * 删除字典数据
 */
export async function deleteDictData(id: string): Promise<ApiResponse<void>> {
  if (!isMock) return request.delete(`/dict/data/${id}`)

  const { dictData } = await import('../../mock/data/dict.data')
  const index = dictData.findIndex(item => item.id === id)
  if (index === -1) return error(404, '字典数据不存在')

  dictData.splice(index, 1)
  return ok(undefined as any, '删除成功')
}
