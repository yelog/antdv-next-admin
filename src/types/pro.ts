// Pro Component Types

// ProTable Types
export type ValueType =
  | 'text'
  | 'date'
  | 'dateTime'
  | 'dateRange'
  | 'time'
  | 'tag'
  | 'badge'
  | 'money'
  | 'percent'
  | 'avatar'
  | 'image'
  | 'link'
  | 'progress'

export type SearchType =
  | 'input'
  | 'select'
  | 'dateRange'
  | 'datePicker'
  | 'number'
  | 'checkbox'
  | 'radio'

export type HeaderFilterMode =
  | 'client'
  | 'server'
  | 'hybrid'

export type ProTableHeaderFilterType =
  | 'keyword'
  | 'select'

export interface ProTableHeaderFilterOption {
  label: string
  value: string | number | boolean
}

export interface ProTableHeaderFilter {
  type: ProTableHeaderFilterType
  mode?: HeaderFilterMode
  icon?: 'search' | 'filter'
  paramKey?: string
  placeholder?: string
  multiple?: boolean
  options?: ProTableHeaderFilterOption[]
  caseSensitive?: boolean
  matchAllKeywords?: boolean
  clientFilter?: (filterValue: any, record: any, column: ProTableColumn) => boolean
  transformRequestValue?: (value: any, selectedValues: any[]) => any
}

export interface ProTableHeaderFilterConfig {
  defaultMode?: HeaderFilterMode
  requestPayload?: 'flat' | 'nested'
  nestedKey?: string
  resetPageOnFilterChange?: boolean
}

export interface ProTableColumn {
  title: string
  dataIndex: string
  key?: string
  width?: number | string
  minWidth?: number | string
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  ellipsis?: boolean
  resizable?: boolean
  hideInTable?: boolean

  // Value rendering
  valueType?: ValueType
  valueEnum?: Record<string, { text: string; status?: string; color?: string }>
  copyable?: boolean

  // Search
  search?: boolean
  searchType?: SearchType
  searchOptions?: Array<{ label: string; value: any }>
  searchProps?: Record<string, any>

  // Header filter
  headerFilter?: ProTableHeaderFilter

  // Sorting
  sorter?: boolean | ((a: any, b: any) => number)
  defaultSortOrder?: 'ascend' | 'descend'

  // Native table filter compatibility
  filterDropdown?: any
  filterDropdownProps?: Record<string, any>
  filterIcon?: any
  filters?: Array<{ text: string; value: any }>
  filterMultiple?: boolean
  filteredValue?: any[] | null
  onFilter?: (value: any, record: any) => boolean
  sortDirections?: Array<'ascend' | 'descend'>
  customFilterDropdown?: boolean

  // Actions column
  actions?: ProTableAction[]

  // Custom render
  render?: (text: any, record: any, index: number) => any
}

export interface ProTableAction {
  label: string
  type?: 'link' | 'button' | 'dropdown'
  icon?: any
  permission?: string
  danger?: boolean
  disabled?: (record: any) => boolean
  hidden?: (record: any) => boolean
  confirm?: string
  onClick?: (record: any) => void | Promise<void>
  items?: ProTableAction[] // For dropdown
}

export interface ProTableToolbar {
  title?: string
  subTitle?: string
  actions?: Array<'refresh' | 'density' | 'export' | 'columnSetting'>
}

export interface ProTableSearch {
  labelWidth?: number
  defaultCollapsed?: boolean
  collapsedRows?: number
  collapseRender?: boolean
}

export interface ProTablePagination {
  current?: number
  pageSize?: number
  total?: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean | ((total: number, range?: [number, number]) => string)
  pageSizeOptions?: string[]
}

export interface ProTableRequest {
  (params: Record<string, any>): Promise<{
    data: any[]
    total?: number
    success: boolean
  }>
}

// ProForm Types
export type FormItemType =
  | 'input'
  | 'password'
  | 'textarea'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'datePicker'
  | 'timePicker'
  | 'dateRange'
  | 'timeRange'
  | 'upload'
  | 'slider'
  | 'rate'
  | 'colorPicker'
  | 'cascader'
  | 'treeSelect'
  | 'custom'

export interface ProFormItem {
  name: string
  label: string
  type: FormItemType
  required?: boolean
  rules?: any[]
  initialValue?: any
  dependencies?: string[]
  tooltip?: string
  placeholder?: string

  // Layout
  colSpan?: number
  hidden?: boolean

  // Options (for select, radio, checkbox, etc.)
  options?: Array<{ label: string; value: any; disabled?: boolean }>

  // Props to pass to the component
  props?: Record<string, any>

  // Value prop name (for components like Switch that use 'checked')
  valuePropName?: string

  // Custom render
  render?: (form: any) => any

  // Request for dynamic options
  request?: () => Promise<Array<{ label: string; value: any }>>
}

export interface ProFormLayout {
  labelCol?: { span: number }
  wrapperCol?: { span: number }
  layout?: 'horizontal' | 'vertical' | 'inline'
}

export interface ProFormGrid {
  gutter?: number
  cols?: number
}
