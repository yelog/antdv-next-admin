<template>
  <a-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    :preserve="preserve"
    :clear-on-destroy="clearOnDestroy"
    v-bind="resolvedLayout"
    @finish="handleFinish"
    class="pro-form"
    :class="{ 'pro-form--inline': isInlineLayout }"
  >
    <div class="pro-form-grid-viewport">
      <a-row
        :gutter="grid?.responsive ? 0 : grid?.gutter || 16"
        :class="{ 'pro-form-responsive-grid': grid?.responsive }"
        :style="responsiveGridStyle"
      >
        <a-col
          v-for="item in visibleFormItems"
          :key="`${item.name}-${resetVersion}`"
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
    </div>

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
import type { ProFormItem, ProFormLayout, ProFormGrid } from '@/types/pro';
import type { FormInstance } from 'antdv-next';

import { cloneDeep } from 'lodash-es';
import { ref, computed, nextTick, watch } from 'vue';

import { $t } from '@/locales';

import FormItemRender from './FormItemRender.vue';
import { buildProFormRules } from './formRules';

type ResponsiveBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const DEFAULT_RESPONSIVE_COLUMNS: Record<ResponsiveBreakpoint, number> = {
  xs: 1,
  sm: 2,
  md: 2,
  lg: 3,
  xl: 3,
};

function normalizeColumnCount(value: unknown, fallback: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(1, Math.floor(value));
}

function resolveResponsiveColumns(
  config: ProFormGrid['responsiveColumns'],
): Record<ResponsiveBreakpoint, number> {
  if (typeof config === 'number') {
    const columns = normalizeColumnCount(config, DEFAULT_RESPONSIVE_COLUMNS.lg);
    return { xs: 1, sm: columns, md: columns, lg: columns, xl: columns };
  }

  if (!config || typeof config !== 'object') {
    return { ...DEFAULT_RESPONSIVE_COLUMNS };
  }

  const next = { ...DEFAULT_RESPONSIVE_COLUMNS };
  (Object.keys(next) as ResponsiveBreakpoint[]).forEach((key) => {
    next[key] = normalizeColumnCount(config[key], next[key]);
  });

  if (!config.md && config.sm) next.md = next.sm;
  if (!config.lg && config.md) next.lg = next.md;
  if (!config.xl && config.lg) next.xl = next.lg;
  return next;
}

interface Props {
  formItems: ProFormItem[];
  initialValues?: Record<string, unknown>;
  layout?: ProFormLayout;
  grid?: ProFormGrid;
  inlineFooter?: boolean;
  preserve?: boolean;
  clearOnDestroy?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  layout: () => ({
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    layout: 'horizontal',
  }),
  grid: () => ({
    gutter: 16,
    cols: 1,
  }),
  inlineFooter: false,
  preserve: true,
  clearOnDestroy: false,
});

const emit = defineEmits(['submit', 'valuesChange', 'finish']);

const formRef = ref<FormInstance>();
const formData = ref<Record<string, unknown>>({});
const resetVersion = ref(0);

// Computed
const isInlineLayout = computed(() => props.layout?.layout === 'inline');

const resolvedLayout = computed(() => {
  if (isInlineLayout.value) {
    return { layout: 'inline' };
  }
  return props.layout;
});

const visibleFormItems = computed(() => {
  return props.formItems.filter((item) => {
    if (typeof item.hidden === 'function') return !item.hidden(formData.value);
    return !item.hidden;
  });
});

const formRules = computed(() => {
  return buildProFormRules(props.formItems, (item) =>
    $t('proForm.enterPlaceholder', {
      label: String(item.label ?? ''),
    }),
  );
});

const responsiveGridStyle = computed(() => {
  if (!props.grid?.responsive) return undefined;

  const columns = resolveResponsiveColumns(props.grid.responsiveColumns);
  return {
    '--pro-form-columns-xs': columns.xs,
    '--pro-form-columns-sm': columns.sm,
    '--pro-form-columns-md': columns.md,
    '--pro-form-columns-lg': columns.lg,
    '--pro-form-columns-xl': columns.xl,
    '--pro-form-grid-gap': `${props.grid.gutter ?? 16}px`,
  };
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
    return {
      style: {
        gridColumn: `span ${Math.max(1, Math.floor(item.colSpan ?? 1))}`,
      },
    };
  }
  return { span: getColSpan(item) };
};

const footerColBindings = computed(() => {
  if (props.grid?.responsive) {
    return {
      style: {
        gridColumn: '-2 / -1',
      },
    };
  }
  return { span: 24 / (props.grid?.cols || 1) };
});

const handleFinish = (values: Record<string, unknown>) => {
  emit('finish', values);
  emit('submit', values);
};

// Watch initial values
watch(
  () => props.initialValues,
  (values) => {
    if (values) {
      formData.value = cloneDeep(values);
    }
  },
  { immediate: true, deep: true },
);

// Expose methods
const validate = async () => {
  if (!formRef.value) {
    return cloneDeep(formData.value);
  }
  return formRef.value.validate();
};

const resetFields = async () => {
  formRef.value?.resetFields();
  formData.value = props.initialValues ? cloneDeep(props.initialValues) : {};
  resetVersion.value += 1;
  await nextTick();
  formData.value = props.initialValues ? cloneDeep(props.initialValues) : {};
};

const clearValidate = () => {
  formRef.value?.clearValidate();
};

const setFieldsValue = (values: Record<string, unknown>) => {
  formData.value = { ...formData.value, ...cloneDeep(values) };
};

const getFieldsValue = () => {
  return cloneDeep(formData.value);
};

defineExpose({
  validate,
  resetFields,
  clearValidate,
  setFieldsValue,
  getFieldsValue,
});

// Watch form data changes
watch(
  formData,
  (values) => {
    emit('valuesChange', values);
  },
  { deep: true },
);
</script>

<style scoped lang="scss">
.pro-form {
  .pro-form-grid-viewport {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    overflow-x: hidden;
    overflow-x: clip;
  }

  .pro-form-responsive-grid {
    display: grid;
    grid-template-columns: repeat(var(--pro-form-columns-xs), minmax(0, 1fr));
    column-gap: var(--pro-form-grid-gap);
    row-gap: 0;

    > :deep(.ant-col) {
      min-width: 0;
      max-width: none;
    }
  }

  @media (min-width: 576px) {
    .pro-form-responsive-grid {
      grid-template-columns: repeat(var(--pro-form-columns-sm), minmax(0, 1fr));
    }
  }

  @media (min-width: 768px) {
    .pro-form-responsive-grid {
      grid-template-columns: repeat(var(--pro-form-columns-md), minmax(0, 1fr));
    }
  }

  @media (min-width: 992px) {
    .pro-form-responsive-grid {
      grid-template-columns: repeat(var(--pro-form-columns-lg), minmax(0, 1fr));
    }
  }

  @media (min-width: 1200px) {
    .pro-form-responsive-grid {
      grid-template-columns: repeat(var(--pro-form-columns-xl), minmax(0, 1fr));
    }
  }

  .form-item-required {
    :deep(.ant-form-item-label > label::before) {
      display: inline-block;
      margin-right: 4px;
      color: var(--color-error);
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
