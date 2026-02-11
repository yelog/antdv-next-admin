export type ProTableDensity = 'large' | 'middle' | 'small' | 'smal'
export type ProTableHeight = '100%' | 'auto' | string | number

export interface ProTableDefaultSettings {
  size: ProTableDensity
  height: ProTableHeight
  resizable: boolean
  ellipsis: boolean
  bordered: boolean
  fixedHeader: boolean
}

export interface InputDefaultSettings {
  allowClear: boolean
}

export interface SelectDefaultSettings {
  allowClear: boolean
}

export interface DatePickerDefaultSettings {
  allowClear: boolean
}

export interface AppDefaultSettings {
  proTable: ProTableDefaultSettings
  input: InputDefaultSettings
  select: SelectDefaultSettings
  datePicker: DatePickerDefaultSettings
}

export const appDefaultSettings: AppDefaultSettings = {
  proTable: {
    size: 'smal',
    height: 'auto',
    resizable: true,
    ellipsis: true,
    bordered: true,
    fixedHeader: true
  },
  input: {
    allowClear: true
  },
  select: {
    allowClear: true
  },
  datePicker: {
    allowClear: true
  }
}
