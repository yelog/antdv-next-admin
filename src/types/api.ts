// API Response Types

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

export interface PageParams {
  current: number
  pageSize: number
  [key: string]: any
}

export interface PageResult<T> {
  list: T[]
  total: number
  current: number
  pageSize: number
}

export interface ListParams extends PageParams {
  keyword?: string
  startDate?: string
  endDate?: string
  status?: string | number
  [key: string]: any
}
