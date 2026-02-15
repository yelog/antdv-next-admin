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
          :tooltip="item.tooltip"
          :dependencies="item.dependencies"
          :value-prop-name="item.valuePropName || 'value'"
          :class="{ 'form-item-required': item.required }"
        >
          <FormItemRender
            v-model:value="formData[item.name]"
            :item="item"
            :form-data="formData"
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
import { $t } from '@/locales'
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
  return props.formItems.filter(item => {
    if (typeof item.hidden === 'function') return !item.hidden(formData.value)
    return !item.hidden
  })
})

const formRules = computed(() => {
  const rules: Record<string, any> = {}
  props.formItems.forEach(item => {
    const itemRules = []

    // 如果字段标记为 required，自动添加 required 规则
    if (item.required) {
      itemRules.push({
        required: true,
        message: $t('proForm.enterPlaceholder', { label: String(item.label ?? '') })
      })
    }

    // 添加自定义规则
    if (item.rules) {
      itemRules.push(...(Array.isArray(item.rules) ? item.rules : [item.rules]))
    }

    if (itemRules.length > 0) {
      rules[item.name] = itemRules
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
  .form-item-required {
    :deep(.ant-form-item-label > label::before) {
      display: inline-block;
      margin-right: 4px;
      color: #ff4d4f;
      font-size: 14px;
      font-family: SimSun, sans-serif;
      line-height: 1;
      content: '*';
    }
  }

  .form-footer {
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-border-secondary);
  }
}
</style>
