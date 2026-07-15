// Pro Component Types

import type { Component } from 'vue';

export type ProTableRecord = object;

export interface ProTableRequestParams {
  current?: number;
  pageSize?: number;
  [key: string]: unknown;
}

export interface ProTableRequestResult<TRecord extends ProTableRecord = ProTableRecord> {
  data: TRecord[];
  total?: number;
  success: boolean;
}

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
  | 'progress';

export type HeaderFilterMode = 'client' | 'server' | 'hybrid';

export type ProTableHeaderFilterType = 'keyword' | 'select';

export interface ProTableHeaderFilterOption {
  label: string;
  value: string | number | boolean;
}

export interface ProTableHeaderFilter<TRecord extends ProTableRecord = ProTableRecord> {
  type: ProTableHeaderFilterType;
  mode?: HeaderFilterMode;
  icon?: 'search' | 'filter';
  paramKey?: string;
  placeholder?: string;
  multiple?: boolean;
  options?: ProTableHeaderFilterOption[];
  caseSensitive?: boolean;
  matchAllKeywords?: boolean;
  clientFilter?: (
    filterValue: unknown,
    record: TRecord,
    column: ProTableColumn<TRecord>,
  ) => boolean;
  transformRequestValue?: (value: unknown, selectedValues: unknown[]) => unknown;
}

export interface ProTableHeaderFilterConfig {
  defaultMode?: HeaderFilterMode;
  requestPayload?: 'flat' | 'nested';
  nestedKey?: string;
  resetPageOnFilterChange?: boolean;
}

export interface ProTableColumn<TRecord extends ProTableRecord = ProTableRecord> {
  title: string;
  dataIndex: string;
  key?: string;
  width?: number | string;
  minWidth?: number | string;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  ellipsis?: boolean;
  resizable?: boolean;
  hideInTable?: boolean;

  // Value rendering
  valueType?: ValueType;
  valueEnum?: Record<string, { text: string; status?: string; color?: string }>;
  valueTypeProps?: Record<string, unknown>;
  copyable?: boolean;

  // Unified options: auto-derives searchOptions and valueEnum when set
  options?: Array<{
    label: string;
    value: string | number | boolean;
    color?: string;
    status?: string;
    disabled?: boolean;
  }>;

  // Search
  search?: boolean;
  searchType?: FormItemType;
  searchOptions?: Array<{ label: string; value: string | number | boolean }>;
  searchProps?: Record<string, unknown>;

  // Header filter
  headerFilter?: ProTableHeaderFilter<TRecord>;

  // Sorting
  sorter?: boolean | ((a: TRecord, b: TRecord) => number);
  defaultSortOrder?: 'ascend' | 'descend';

  // Native table filter compatibility
  filterDropdown?: unknown;
  filterDropdownProps?: Record<string, unknown>;
  filterIcon?: unknown;
  filters?: Array<{ text: string; value: string | number | boolean }>;
  filterMultiple?: boolean;
  filteredValue?: (string | number | boolean)[] | null;
  onFilter?: (value: unknown, record: TRecord) => boolean;
  sortDirections?: Array<'ascend' | 'descend'>;
  customFilterDropdown?: boolean;

  // Actions column
  actions?: ProTableAction[];

  // Custom render
  render?: (text: unknown, record: TRecord, index: number) => unknown;
}

export interface ProTableAction {
  label: string;
  type?: 'link' | 'button' | 'dropdown';
  icon?: unknown;
  permission?: string;
  danger?: boolean;
  disabled?: (record: Record<string, unknown>) => boolean;
  hidden?: (record: Record<string, unknown>) => boolean;
  confirm?: string;
  onClick?: (record: Record<string, unknown>) => void | Promise<void>;
  items?: ProTableAction[];
}

export interface ProTableToolbar {
  title?: string;
  subTitle?: string;
  actions?: Array<
    '!refresh' | '!density' | '!columnSetting' | 'refresh' | 'density' | 'columnSetting'
  >;
}

export interface ProTableSearch {
  labelWidth?: number;
  defaultCollapsed?: boolean;
  collapsedRows?: number;
  columnsPerRow?: number | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>>;
  collapseRender?: boolean;
  formItems?: ProFormItem[];
}

export interface ProTablePagination {
  current?: number;
  pageSize?: number;
  total?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean | ((total: number, range?: [number, number]) => string);
  pageSizeOptions?: string[];
}

export interface ProTableRequest<
  TRecord extends ProTableRecord = ProTableRecord,
  TParams extends ProTableRequestParams = ProTableRequestParams,
> {
  (params: TParams): Promise<ProTableRequestResult<TRecord>>;
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
  | 'imageUpload'
  | 'avatarUpload'
  | 'slider'
  | 'rate'
  | 'colorPicker'
  | 'cascader'
  | 'treeSelect'
  | 'custom';

export interface ProFormOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
  children?: ProFormOption[];
}

export interface ProFormItem {
  name: string;
  label: string;
  type: FormItemType;
  required?: boolean;
  rules?: unknown[];
  initialValue?: unknown;
  dependencies?: string[];
  tooltip?: string;
  placeholder?: string;

  // Layout
  colSpan?: number;
  hidden?: boolean | ((values: Record<string, unknown>) => boolean);

  // Options (for select, radio, checkbox, etc.) — supports function form for dynamic options
  options?: ProFormOption[] | ((values: Record<string, unknown>) => ProFormOption[]);

  // Props to pass to the component
  props?: Record<string, unknown>;

  // Search behavior for select-like fields. Local search is enabled by default.
  searchable?: boolean;
  searchMode?: 'local' | 'remote';
  remoteSearch?: (keyword: string) => Promise<ProFormOption[]>;

  // Value prop name (for components like Switch that use 'checked')
  valuePropName?: string;

  // Custom render
  render?: Component;

  // Request for dynamic options
  request?: () => Promise<ProFormOption[]>;
}

export interface ProFormLayout {
  labelCol?: { span: number };
  wrapperCol?: { span: number };
  layout?: 'horizontal' | 'vertical' | 'inline';
}

export interface ProFormGrid {
  gutter?: number;
  cols?: number;
  responsive?: boolean;
  responsiveColumns?: number | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>>;
}

export interface ProFormInstance<TValues extends object = Record<string, unknown>> {
  validate: () => Promise<TValues>;
  resetFields: () => void;
  clearValidate: () => void;
  setFieldsValue: (values: Partial<TValues>) => void;
  getFieldsValue: () => TValues;
}

// ProDescriptions Types
export interface ProDescriptionItem {
  label: string;
  dataIndex: string;
  valueType?: ValueType;
  valueEnum?: Record<string, { text: string; status?: string; color?: string }>;
  valueTypeProps?: Record<string, unknown>;
  span?: number;
  render?: (value: unknown, record: Record<string, unknown>) => unknown;
  copyable?: boolean;
}

// ProStatus Types
export type ProStatusMode = 'dot' | 'tag' | 'badge';

export interface ProStatusMap {
  [key: string]: {
    text: string;
    color: string;
    icon?: unknown;
  };
}

// ProChart Types
export type ProChartType = 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'radar';

export interface ProChartProps {
  type: ProChartType;
  data: Record<string, unknown>[];
  height?: number | string;
  title?: string;
  subTitle?: string;
  loading?: boolean;
  option?: Record<string, unknown>;
}

// ProUpload Types
export type ProUploadMode = 'button' | 'dragger' | 'image' | 'avatar';

// ProStatCard Types
export type ProStatCardTone = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'cyan';

export interface ProStatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down';
  icon?: unknown;
  tone?: ProStatCardTone;
}

// ProStepForm Types
export interface ProStepFormStep {
  title: string;
  description?: string;
  icon?: unknown;
}

// ProSplitLayout Types
export interface ProSplitLayoutProps {
  sideWidth?: number | string;
  sidePosition?: 'left' | 'right';
  gap?: number | string;
}

// ProDetail Types
export interface ProDetailTab {
  key: string;
  label: string;
}
