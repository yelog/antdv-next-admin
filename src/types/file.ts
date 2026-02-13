/**
 * 系统文件
 */
export interface SysFile {
  id: string
  /** 文件名 */
  name: string
  /** 原始文件名 */
  originalName: string
  /** 文件路径 */
  path: string
  /** 文件大小（字节） */
  size: number
  /** MIME 类型 */
  mimeType: string
  /** 文件扩展名 */
  ext: string
  /** 存储方式 */
  storage: 'local' | 'oss' | 'cos'
  /** 上传者 */
  uploader: string
  /** 备注 */
  remark?: string
  createTime: string
}

/**
 * 文件查询参数
 */
export interface SysFileQueryParams {
  name?: string
  ext?: string
  storage?: string
  page?: number
  pageSize?: number
}
