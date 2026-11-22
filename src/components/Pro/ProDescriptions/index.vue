<template>
  <a-descriptions
    :column="column"
    :bordered="bordered"
    :size="normalizedSize"
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
        {{ getValue(item) ?? "-" }}
      </template>
    </a-descriptions-item>
  </a-descriptions>
</template>

<script setup lang="ts">
import type { ProDescriptionItem } from "@/types/pro";

import { computed } from "vue";

import ValueTypeRender from "../ProTable/ValueTypeRender.vue";

interface Props {
  columns: ProDescriptionItem[];
  data: Record<string, unknown>;
  column?: number;
  bordered?: boolean;
  size?: "default" | "large" | "medium" | "middle" | "small";
  title?: string;
  layout?: "horizontal" | "vertical";
}

const props = withDefaults(defineProps<Props>(), {
  column: 2,
  bordered: false,
  size: "large",
  layout: "horizontal",
});

const normalizedSize = computed(() => {
  if (props.size === "default") return "large";
  if (props.size === "middle") return "medium";
  return props.size;
});

const getValue = (item: ProDescriptionItem) => {
  const keys = item.dataIndex.split(".");
  let val: unknown = props.data;
  for (const key of keys) {
    if (val == null) return undefined;
    val = (val as Record<string, unknown>)[key];
  }
  return val;
};
</script>
