/**
 * 部门/组织架构
 */
export interface Department {
  id: string
  /** 部门名称 */
  name: string
  /** 父级ID */
  parentId: string | null
  /** 负责人 */
  leader?: string
  /** 联系电话 */
  phone?: string
  /** 邮箱 */
  email?: string
  /** 排序 */
  sort: number
  /** 状态 */
  status: 'enabled' | 'disabled'
  /** 备注 */
  remark?: string
  createTime: string
  updateTime: string
  /** 子部门 */
  children?: Department[]
}

/**
 * 部门查询参数
 */
export interface DeptQueryParams {
  name?: string
  status?: 'enabled' | 'disabled'
}
