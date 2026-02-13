/**
 * 字典类型
 */
export interface DictType {
  id: string
  name: string
  code: string
  description?: string
  status: 'enabled' | 'disabled'
  createTime: string
  updateTime: string
}

/**
 * 字典数据
 */
export interface DictData {
  id: string
  typeCode: string
  label: string
  value: string
  sort: number
  status: 'enabled' | 'disabled'
  remark?: string
  createTime: string
  updateTime: string
}

/**
 * 字典数据分组（按类型分组）
 */
export interface DictGroup {
  [typeCode: string]: DictData[]
}

/**
 * 字典查询参数
 */
export interface DictQueryParams {
  typeCode?: string
  label?: string
  value?: string
  status?: 'enabled' | 'disabled'
  page?: number
  pageSize?: number
}

/**
 * 字典类型查询参数
 */
export interface DictTypeQueryParams {
  name?: string
  code?: string
  status?: 'enabled' | 'disabled'
  page?: number
  pageSize?: number
}
