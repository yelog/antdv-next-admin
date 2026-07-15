<template>
  <div class="form-item-render">
    <!-- Input -->
    <a-input
      v-if="item.type === 'input'"
      v-model:value="modelValue"
      :placeholder="resolveInputPlaceholder()"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Password -->
    <a-input-password
      v-else-if="item.type === 'password'"
      v-model:value="modelValue"
      :placeholder="resolveInputPlaceholder()"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Textarea -->
    <a-textarea
      v-else-if="item.type === 'textarea'"
      v-model:value="modelValue"
      :placeholder="resolveInputPlaceholder()"
      :rows="4"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Number -->
    <a-input-number
      v-else-if="item.type === 'number'"
      v-model:value="modelValue"
      :placeholder="resolveInputPlaceholder()"
      style="width: 100%"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Select -->
    <a-select
      v-else-if="item.type === 'select'"
      v-model:value="modelValue"
      :placeholder="resolveSelectPlaceholder()"
      :options="displayedOptions"
      :show-search="resolveShowSearch()"
      :filter-option="resolveFilterOption()"
      :loading="remoteLoading"
      v-bind="item.props"
      @search="handleSearch"
      @update:value="handleChange"
    />

    <!-- Radio -->
    <a-radio-group
      v-else-if="item.type === 'radio'"
      v-model:value="modelValue"
      :options="resolvedOptions"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Checkbox -->
    <a-checkbox-group
      v-else-if="item.type === 'checkbox'"
      v-model:value="modelValue"
      :options="resolvedOptions"
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
      :placeholder="resolveSelectPlaceholder()"
      style="width: 100%"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Time Picker -->
    <a-time-picker
      v-else-if="item.type === 'timePicker'"
      v-model:value="modelValue"
      :placeholder="resolveSelectPlaceholder()"
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
    <ProUpload
      v-else-if="item.type === 'upload'"
      :value="modelValue"
      mode="button"
      :button-text="item.placeholder"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Image Upload -->
    <ProUpload
      v-else-if="item.type === 'imageUpload'"
      :value="modelValue"
      mode="image"
      :button-text="item.placeholder"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Avatar Upload -->
    <ProUpload
      v-else-if="item.type === 'avatarUpload'"
      :value="modelValue"
      mode="avatar"
      v-bind="item.props"
      @update:value="handleChange"
    />

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
      :placeholder="resolveSelectPlaceholder()"
      :options="resolvedOptions"
      style="width: 100%"
      v-bind="item.props"
      @update:value="handleChange"
    />

    <!-- Tree Select -->
    <TreeSelect
      v-else-if="item.type === 'treeSelect'"
      v-model:value="modelValue"
      :placeholder="resolveSelectPlaceholder()"
      :tree-data="treeSelectData"
      :show-search="treeSelectShowSearch"
      :filter-tree-node="treeSelectFilterTreeNode"
      :tree-expanded-keys="isRemoteSearch ? remoteTreeExpandedKeys : undefined"
      :loading="remoteLoading"
      style="width: 100%"
      v-bind="item.props"
      @search="handleSearch"
      @update:value="handleChange"
    />

    <!-- Custom -->
    <component
      v-else-if="item.type === 'custom' && item.render"
      :is="item.render"
      v-bind="item.props"
      v-model:value="modelValue"
      @update:value="handleChange"
    />

    <!-- Default -->
    <a-input
      v-else
      v-model:value="modelValue"
      :placeholder="resolveInputPlaceholder()"
      v-bind="item.props"
      @update:value="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProFormItem, ProFormOption } from '@/types/pro';
import type { TreeSelectProps } from 'antdv-next';

import { TreeSelect } from 'antdv-next';
import { ref, watch, computed } from 'vue';

import { $t } from '@/locales';

import ProUpload from '../ProUpload/index.vue';
import {
  createRemoteOptionsController,
  localFilterOption,
  localFilterTreeNode,
  toTreeSelectData,
} from './selectSearch';

interface Props {
  value?: unknown;
  item: ProFormItem;
  formData?: Record<string, unknown>;
}

const props = withDefaults(defineProps<Props>(), {
  formData: () => ({}),
});
const emit = defineEmits(['update:value', 'change']);

const modelValue = ref(props.value ?? props.item.initialValue);

const resolvedOptions = computed(() => {
  if (typeof props.item.options === 'function') {
    return props.item.options(props.formData);
  }
  return props.item.options ?? [];
});

const remoteSearchController = createRemoteOptionsController();
const remoteOptions = ref<ProFormOption[] | null>(null);
const remoteLoading = ref(false);
const remoteTreeExpandedKeys = ref<Array<string | number>>([]);

const displayedOptions = computed(() => {
  return remoteOptions.value ?? resolvedOptions.value;
});

const isRemoteSearch = computed(() => {
  return props.item.searchMode === 'remote' && typeof props.item.remoteSearch === 'function';
});

const resolveShowSearch = () => {
  if (props.item.props && 'showSearch' in props.item.props) {
    return props.item.props.showSearch;
  }
  return props.item.searchable !== false;
};

const resolveFilterOption = () => {
  if (isRemoteSearch.value) return false;
  if (props.item.props && 'filterOption' in props.item.props) {
    return props.item.props.filterOption;
  }
  return localFilterOption;
};

const resolveFilterTreeNode = () => {
  if (isRemoteSearch.value) return false;
  if (props.item.props && 'filterTreeNode' in props.item.props) {
    return props.item.props.filterTreeNode;
  }
  return localFilterTreeNode;
};

const treeSelectData = computed(() => {
  return toTreeSelectData(displayedOptions.value) as unknown as TreeSelectProps['treeData'];
});

const treeSelectShowSearch = computed(() => {
  return resolveShowSearch() as TreeSelectProps['showSearch'];
});

const treeSelectFilterTreeNode = computed(() => {
  return resolveFilterTreeNode() as TreeSelectProps['filterTreeNode'];
});

const handleSearch = async (keyword: string) => {
  if (!isRemoteSearch.value || !props.item.remoteSearch) return;
  remoteLoading.value = Boolean(keyword.trim());
  const result = await remoteSearchController.search(keyword, props.item.remoteSearch);
  if (result.status === 'success') {
    remoteOptions.value = result.options;
    remoteTreeExpandedKeys.value = result.options.map((option) =>
      typeof option.value === 'boolean' ? String(option.value) : option.value,
    );
  } else if (result.status !== 'stale') {
    remoteOptions.value = null;
    remoteTreeExpandedKeys.value = [];
  }
  if (result.status !== 'stale') {
    remoteLoading.value = false;
  }
};

watch(
  () => props.value,
  (val) => {
    modelValue.value = val;
  },
);

watch(modelValue, (val) => {
  emit('update:value', val);
  emit('change', val);
});

watch(
  () => [props.item.name, props.item.searchMode, props.item.remoteSearch],
  () => {
    remoteSearchController.reset();
    remoteOptions.value = null;
    remoteLoading.value = false;
    remoteTreeExpandedKeys.value = [];
  },
);

const handleChange = (value: unknown) => {
  emit('update:value', value);
  emit('change', value);
};

const resolveLabel = () => {
  return String(props.item.label ?? '');
};

const resolveInputPlaceholder = () => {
  return props.item.placeholder || $t('proForm.enterPlaceholder', { label: resolveLabel() });
};

const resolveSelectPlaceholder = () => {
  return props.item.placeholder || $t('proForm.selectPlaceholder', { label: resolveLabel() });
};
</script>
