<template>
  <a-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    v-bind="layout"
    @finish="handleFinish"
    class="pro-form"
  >
    <a-row :gutter="grid?.gutter || 16">
      <a-col
        v-for="item in visibleFormItems"
        :key="item.name"
        :span="getColSpan(item)"
      >
        <a-form-item
          :name="item.name"
          :label="item.label"
          :required="item.required"
          :tooltip="item.tooltip"
          :dependencies="item.dependencies"
          :value-prop-name="item.valuePropName || 'value'"
        >
          <FormItemRender
            v-model:value="formData[item.name]"
            :item="item"
          />
        </a-form-item>
      </a-col>
    </a-row>

    <a-form-item
      v-if="$slots.footer"
      :wrapper-col="{ offset: layout.labelCol?.span || 0 }"
      class="form-footer"
    >
      <slot name="footer"></slot>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ProFormItem, ProFormLayout, ProFormGrid } from '@/types/pro'
import FormItemRender from './FormItemRender.vue'

interface Props {
  formItems: ProFormItem[]
  initialValues?: Record<string, any>
  layout?: ProFormLayout
  grid?: ProFormGrid
}

const props = withDefaults(defineProps<Props>(), {
  layout: () => ({
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    layout: 'horizontal'
  }),
  grid: () => ({
    gutter: 16,
    cols: 1
  })
})

const emit = defineEmits(['submit', 'valuesChange', 'finish'])

const formRef = ref()
const formData = ref<Record<string, any>>({})

// Computed
const visibleFormItems = computed(() => {
  return props.formItems.filter(item => !item.hidden)
})

const formRules = computed(() => {
  const rules: Record<string, any> = {}
  props.formItems.forEach(item => {
    if (item.rules) {
      rules[item.name] = item.rules
    } else if (item.required) {
      rules[item.name] = [
        { required: true, message: `请输入${item.label}` }
      ]
    }
  })
  return rules
})

// Methods
const getColSpan = (item: ProFormItem) => {
  if (item.colSpan) {
    return (24 / (props.grid?.cols || 1)) * item.colSpan
  }
  return 24 / (props.grid?.cols || 1)
}

const handleFinish = (values: any) => {
  emit('finish', values)
  emit('submit', values)
}

// Watch initial values
watch(
  () => props.initialValues,
  (values) => {
    if (values) {
      formData.value = { ...values }
    }
  },
  { immediate: true, deep: true }
)

// Watch form data changes
watch(
  formData,
  (values) => {
    emit('valuesChange', values)
  },
  { deep: true }
)

// Expose methods
const validate = async () => {
  try {
    await formRef.value?.validate()
    return true
  } catch {
    return false
  }
}

const resetFields = () => {
  formRef.value?.resetFields()
}

const setFieldsValue = (values: Record<string, any>) => {
  formData.value = { ...formData.value, ...values }
}

const getFieldsValue = () => {
  return formData.value
}

defineExpose({
  validate,
  resetFields,
  setFieldsValue,
  getFieldsValue,
  formRef
})
</script>

<style scoped lang="scss">
.pro-form {
  .form-footer {
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-border-secondary);
  }
}
</style>
