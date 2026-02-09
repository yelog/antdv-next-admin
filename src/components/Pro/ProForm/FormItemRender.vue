<template>
  <div class="form-item-render">
    <!-- Input -->
    <a-input
      v-if="item.type === 'input'"
      v-model:value="modelValue"
      :placeholder="item.placeholder || `请输入${item.label}`"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Password -->
    <a-input-password
      v-else-if="item.type === 'password'"
      v-model:value="modelValue"
      :placeholder="item.placeholder || `请输入${item.label}`"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Textarea -->
    <a-textarea
      v-else-if="item.type === 'textarea'"
      v-model:value="modelValue"
      :placeholder="item.placeholder || `请输入${item.label}`"
      :rows="4"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Number -->
    <a-input-number
      v-else-if="item.type === 'number'"
      v-model:value="modelValue"
      :placeholder="item.placeholder || `请输入${item.label}`"
      style="width: 100%"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Select -->
    <a-select
      v-else-if="item.type === 'select'"
      v-model:value="modelValue"
      :placeholder="item.placeholder || `请选择${item.label}`"
      :options="item.options"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Radio -->
    <a-radio-group
      v-else-if="item.type === 'radio'"
      v-model:value="modelValue"
      :options="item.options"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Checkbox -->
    <a-checkbox-group
      v-else-if="item.type === 'checkbox'"
      v-model:value="modelValue"
      :options="item.options"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Switch -->
    <a-switch
      v-else-if="item.type === 'switch'"
      v-model:checked="modelValue"
      v-bind="item.props"
      @update:checked="handleChange"
    />

    <!-- Date Picker -->
    <a-date-picker
      v-else-if="item.type === 'datePicker'"
      v-model:value="modelValue"
      :placeholder="item.placeholder || `请选择${item.label}`"
      style="width: 100%"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Time Picker -->
    <a-time-picker
      v-else-if="item.type === 'timePicker'"
      v-model:value="modelValue"
      :placeholder="item.placeholder || `请选择${item.label}`"
      style="width: 100%"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Date Range -->
    <a-range-picker
      v-else-if="item.type === 'dateRange'"
      v-model:value="modelValue"
      style="width: 100%"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Upload -->
    <a-upload
      v-else-if="item.type === 'upload'"
      v-model:file-list="modelValue"
      v-bind="item.props"
      @update:file-list="handleChange"
    >
      <a-button>
        <UploadOutlined />
        {{ item.placeholder || '上传文件' }}
      </a-button>
    </a-upload>

    <!-- Slider -->
    <a-slider
      v-else-if="item.type === 'slider'"
      v-model:value="modelValue"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Rate -->
    <a-rate
      v-else-if="item.type === 'rate'"
      v-model:value="modelValue"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Cascader -->
    <a-cascader
      v-else-if="item.type === 'cascader'"
      v-model:value="modelValue"
      :placeholder="item.placeholder || `请选择${item.label}`"
      :options="item.options"
      style="width: 100%"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Tree Select -->
    <a-tree-select
      v-else-if="item.type === 'treeSelect'"
      v-model:value="modelValue"
      :placeholder="item.placeholder || `请选择${item.label}`"
      :tree-data="item.options"
      style="width: 100%"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Custom -->
    <component
      v-else-if="item.type === 'custom' && item.render"
      :is="item.render"
      v-model:value="modelValue"
      @update:value="handleChange"
    />

    <!-- Default -->
    <a-input
      v-else
      v-model:value="modelValue"
      :placeholder="item.placeholder || `请输入${item.label}`"
      v-bind="item.props"
      @update:value="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { UploadOutlined } from '@antdv-next/icons'
import type { ProFormItem } from '@/types/pro'

interface Props {
  value?: any
  item: ProFormItem
}

const props = defineProps<Props>()
const emit = defineEmits(['update:value', 'change'])

const modelValue = ref(props.value ?? props.item.initialValue)

watch(
  () => props.value,
  (val) => {
    modelValue.value = val
  }
)

watch(
  modelValue,
  (val) => {
    emit('update:value', val)
    emit('change', val)
  }
)

const handleChange = (value: any) => {
  emit('update:value', value)
  emit('change', value)
}
</script>
