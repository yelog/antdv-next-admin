import type { App, Component } from 'vue'
import { defineComponent, h } from 'vue'
import { Select, DatePicker, DateRangePicker } from 'antdv-next'
import { appDefaultSettings } from '@/settings'

type AttrMap = Record<string, unknown>

const withAllowClearDefault = (
  name: string,
  component: Component,
  getDefaultAllowClear: () => boolean
) => {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        const props = attrs as AttrMap
        const allowClear = props.allowClear ?? getDefaultAllowClear()

        return h(component as any, { ...props, allowClear }, slots)
      }
    }
  })
}

const SelectWithDefaults = withAllowClearDefault(
  'ASelectWithDefaults',
  Select,
  () => appDefaultSettings.select.allowClear
)

const DatePickerWithDefaults = withAllowClearDefault(
  'ADatePickerWithDefaults',
  DatePicker,
  () => appDefaultSettings.datePicker.allowClear
)

const RangePickerWithDefaults = withAllowClearDefault(
  'ARangePickerWithDefaults',
  DateRangePicker,
  () => appDefaultSettings.datePicker.allowClear
)

export const registerDefaultComponentProps = (app: App) => {
  app.component('ASelect', SelectWithDefaults)
  app.component('ADatePicker', DatePickerWithDefaults)
  app.component('ARangePicker', RangePickerWithDefaults)
}
