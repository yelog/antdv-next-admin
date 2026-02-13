/**
 * 系统配置项
 */
export interface SysConfig {
  id: string
  /** 配置名称 */
  name: string
  /** 配置键 */
  key: string
  /** 配置值 */
  value: string
  /** 值类型 */
  valueType: 'string' | 'number' | 'boolean' | 'json'
  /** 分组 */
  group: string
  /** 描述 */
  description?: string
  /** 是否内置（内置不可删除） */
  builtIn: boolean
  /** 排序 */
  sort: number
  createTime: string
  updateTime: string
}

/**
 * 系统配置查询参数
 */
export interface SysConfigQueryParams {
  name?: string
  key?: string
  group?: string
  page?: number
  pageSize?: number
}
