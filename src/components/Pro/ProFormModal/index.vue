<template>
  <ProModal
    v-bind="$attrs"
    :open="open"
    :title="title"
    :width="width"
    :confirm-loading="confirmLoading"
    :draggable="draggable"
    :resizable="resizable"
    :fullscreenable="fullscreenable"
    :destroy-on-hidden="true"
    :after-open-change="handleAfterOpenChange"
    @update:open="handleUpdateOpen"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <slot name="before-form" />
    <ProForm
      :key="sessionKey"
      ref="formRef"
      :form-items="formItems"
      :initial-values="initialValues"
      :layout="layout"
      :grid="grid"
      :preserve="false"
      :clear-on-destroy="true"
      @values-change="handleValuesChange"
    />
    <slot name="after-form" />
  </ProModal>
</template>

<script setup lang="ts">
import type { ProFormGrid, ProFormInstance, ProFormItem, ProFormLayout } from '@/types/pro';
import type { ModalProps } from 'antdv-next';

import { ref } from 'vue';

import ProForm from '../ProForm/index.vue';
import ProModal from '../ProModal/index.vue';

defineOptions({ inheritAttrs: false });

interface Props {
  open?: boolean;
  title?: ModalProps['title'];
  width?: ModalProps['width'];
  confirmLoading?: boolean;
  sessionKey: number | string;
  formItems: ProFormItem[];
  initialValues?: Record<string, unknown>;
  layout?: ProFormLayout;
  grid?: ProFormGrid;
  draggable?: boolean;
  resizable?: boolean;
  fullscreenable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  width: 520,
  confirmLoading: false,
  initialValues: () => ({}),
  draggable: false,
  resizable: false,
  fullscreenable: false,
});

const emit = defineEmits<{
  (event: 'update:open', open: boolean): void;
  (event: 'submit', values: Record<string, unknown>): void;
  (event: 'valuesChange', values: Record<string, unknown>): void;
  (event: 'cancel', sourceEvent: MouseEvent | KeyboardEvent): void;
  (event: 'closed'): void;
}>();

const formRef = ref<ProFormInstance | null>(null);

const handleUpdateOpen = (open: boolean) => {
  emit('update:open', open);
};

const handleCancel = (event: MouseEvent | KeyboardEvent) => {
  emit('cancel', event);
};

const handleValuesChange = (values: Record<string, unknown>) => {
  emit('valuesChange', values);
};

const handleAfterOpenChange = (open: boolean) => {
  if (!open) {
    emit('closed');
  }
};

const handleOk = async () => {
  const validationSessionKey = props.sessionKey;

  try {
    const values = await formRef.value?.validate();
    if (!values || !props.open || props.sessionKey !== validationSessionKey) {
      return;
    }
    emit('submit', values);
  } catch {
    // Antdv Form displays validation failures in the active form session.
  }
};

defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: () => formRef.value?.clearValidate(),
  getFieldsValue: () => formRef.value?.getFieldsValue(),
});
</script>
