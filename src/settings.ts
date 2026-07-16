import type { ProTableSearch } from '@/types/pro';

export type ProTableDensity = 'large' | 'middle' | 'small' | 'smal';
export type ProTableHeight = '100%' | 'auto' | string | number;

export interface ProTableSearchDefaultSettings {
  columnsPerRow: NonNullable<ProTableSearch['columnsPerRow']>;
}

export interface ProTableDefaultSettings {
  size: ProTableDensity;
  height: ProTableHeight;
  resizable: boolean;
  columnResizable: boolean;
  ellipsis: boolean;
  bordered: boolean;
  fixedHeader: boolean;
  search: ProTableSearchDefaultSettings;
}

export interface InputDefaultSettings {
  allowClear: boolean;
}

export interface SelectDefaultSettings {
  allowClear: boolean;
}

export interface DatePickerDefaultSettings {
  allowClear: boolean;
}

export interface ButtonDefaultSettings {
  size: 'large' | 'middle' | 'small';
}

export interface AppDefaultSettings {
  proTable: ProTableDefaultSettings;
  input: InputDefaultSettings;
  select: SelectDefaultSettings;
  datePicker: DatePickerDefaultSettings;
  button: ButtonDefaultSettings;
}

export const appDefaultSettings: AppDefaultSettings = {
  proTable: {
    size: 'smal',
    height: 'auto',
    resizable: true,
    columnResizable: true,
    ellipsis: true,
    bordered: true,
    fixedHeader: true,
    search: {
      columnsPerRow: {
        xs: 1,
        sm: 2,
        md: 2,
        lg: 3,
        xl: 3,
      },
    },
  },
  input: {
    allowClear: true,
  },
  select: {
    allowClear: true,
  },
  datePicker: {
    allowClear: true,
  },
  button: {
    size: 'middle',
  },
};
