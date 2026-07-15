<template>
  <a-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    v-bind="resolvedLayout"
    @finish="handleFinish"
    class="pro-form"
    :class="{ 'pro-form--inline': isInlineLayout }"
  >
    <a-row :gutter="grid?.gutter || 16">
      <a-col
        v-for="item in visibleFormItems"
        :key="item.name"
        v-bind="getColBindings(item)"
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

      <!-- 内联 footer（搜索按钮等） -->
      <a-col
        v-if="inlineFooter && $slots.footer"
        v-bind="footerColBindings"
        class="form-footer-col"
      >
        <a-form-item
          :label-col="{ span: 0 }"
          :wrapper-col="{ span: 24 }"
          class="form-footer-inline"
        >
          <slot name="footer"></slot>
        </a-form-item>
      </a-col>
    </a-row>

    <!-- 非内联 footer -->
    <a-form-item
      v-if="!inlineFooter && $slots.footer"
      :wrapper-col="{ offset: layout?.labelCol?.span || 0 }"
      class="form-footer"
    >
      <slot name="footer"></slot>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import type { ProFormItem, ProFormLayout, ProFormGrid } from "@/types/pro";

import { ref, computed, watch } from "vue";

import { $t } from "@/locales";

import FormItemRender from "./FormItemRender.vue";
import { buildProFormRules } from "./formRules";

interface Props {
  formItems: ProFormItem[];
  initialValues?: Record<string, unknown>;
  layout?: ProFormLayout;
  grid?: ProFormGrid;
  inlineFooter?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  layout: () => ({
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    layout: "horizontal",
  }),
  grid: () => ({
    gutter: 16,
    cols: 1,
  }),
  inlineFooter: false,
});

const emit = defineEmits(["submit", "valuesChange", "finish"]);

const formRef = ref();
const formData = ref<Record<string, unknown>>({});

// Computed
const isInlineLayout = computed(() => props.layout?.layout === "inline");

const resolvedLayout = computed(() => {
  if (isInlineLayout.value) {
    return { layout: "inline" };
  }
  return props.layout;
});

const visibleFormItems = computed(() => {
  return props.formItems.filter((item) => {
    if (typeof item.hidden === "function") return !item.hidden(formData.value);
    return !item.hidden;
  });
});

const formRules = computed(() => {
  return buildProFormRules(props.formItems, (item) =>
    $t("proForm.enterPlaceholder", {
      label: String(item.label ?? ""),
    }),
  );
});

// Methods
const getColSpan = (item: ProFormItem) => {
  if (item.colSpan) {
    return (24 / (props.grid?.cols || 1)) * item.colSpan;
  }
  return 24 / (props.grid?.cols || 1);
};

const getColBindings = (item: ProFormItem) => {
  if (props.grid?.responsive) {
    return { xs: 24, sm: 12, lg: 8 };
  }
  return { span: getColSpan(item) };
};

const footerColBindings = computed(() => {
  if (props.grid?.responsive) {
    return { xs: 24, sm: 12, lg: 8 };
  }
  return { span: 24 / (props.grid?.cols || 1) };
});

const handleFinish = (values: Record<string, unknown>) => {
  emit("finish", values);
  emit("submit", values);
};

// Watch initial values
watch(
  () => props.initialValues,
  (values) => {
    if (values) {
      formData.value = { ...values };
    }
  },
  { immediate: true, deep: true },
);

// Expose methods
const validate = async () => {
  return formRef.value?.validate();
};

const resetFields = () => {
  formRef.value?.resetFields();
  formData.value = props.initialValues ? { ...props.initialValues } : {};
};

const setFieldsValue = (values: Record<string, unknown>) => {
  formData.value = { ...formData.value, ...values };
};

const getFieldsValue = () => {
  return formData.value;
};

defineExpose({
  validate,
  resetFields,
  setFieldsValue,
  getFieldsValue,
});

// Watch form data changes
watch(
  formData,
  (values) => {
    emit("valuesChange", values);
  },
  { deep: true },
);
</script>

<style scoped lang="scss">
.pro-form {
  .form-item-required {
    :deep(.ant-form-item-label > label::before) {
      display: inline-block;
      margin-right: 4px;
      color: var(--color-error);
      font-size: 14px;
      font-family: SimSun, sans-serif;
      line-height: 1;
      content: "*";
    }
  }

  .form-footer {
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-border-secondary);
  }

  .form-footer-col {
    margin-left: auto;
  }

  .form-footer-inline {
    :deep(.ant-form-item-explain),
    :deep(.ant-form-item-extra) {
      display: none;
    }

    :deep(.ant-form-item-control) {
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
    }
  }
}
</style>
