<template>
  <a-descriptions
    :column="column"
    :bordered="bordered"
    :size="size"
    :title="title"
    :layout="layout"
  >
    <a-descriptions-item
      v-for="item in columns"
      :key="item.dataIndex"
      :label="item.label"
      :span="item.span"
    >
      <template v-if="item.render">
        <component :is="item.render(getValue(item), data)" />
      </template>
      <template v-else-if="item.valueType">
        <ValueTypeRender
          :value="getValue(item)"
          :type="item.valueType"
          :enum="item.valueEnum"
          :record="data"
          :copyable="item.copyable"
          :value-type-props="item.valueTypeProps ?? {}"
        />
      </template>
      <template v-else>
        {{ getValue(item) ?? '-' }}
      </template>
    </a-descriptions-item>
  </a-descriptions>
</template>

<script setup lang="ts">
import type { ProDescriptionItem } from '@/types/pro'
import ValueTypeRender from '../ProTable/ValueTypeRender.vue'

interface Props {
  columns: ProDescriptionItem[]
  data: Record<string, any>
  column?: number
  bordered?: boolean
  size?: 'default' | 'middle' | 'small'
  title?: string
  layout?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<Props>(), {
  column: 2,
  bordered: false,
  size: 'default',
  layout: 'horizontal'
})

const getValue = (item: ProDescriptionItem) => {
  const keys = item.dataIndex.split('.')
  let val: any = props.data
  for (const key of keys) {
    if (val == null) return undefined
    val = val[key]
  }
  return val
}
</script>
