<template>
  <div class="pro-detail">
    <!-- Header -->
    <div v-if="title || subTitle || tags?.length || $slots.extra" class="pro-detail-header">
      <div class="pro-detail-header-main">
        <h3 v-if="title" class="pro-detail-title">{{ title }}</h3>
        <span v-if="subTitle" class="pro-detail-subtitle">{{ subTitle }}</span>
        <a-tag v-for="tag in tags" :key="tag.text" :color="tag.color">{{ tag.text }}</a-tag>
      </div>
      <div v-if="$slots.extra" class="pro-detail-extra">
        <slot name="extra" />
      </div>
    </div>

    <!-- Descriptions -->
    <ProDescriptions
      v-if="descriptions?.length && data"
      :columns="descriptions"
      :data="data"
      :column="descriptionColumn"
      bordered
      size="small"
      class="pro-detail-descriptions"
    />

    <!-- Tabs -->
    <a-tabs
      v-if="tabs?.length"
      v-model:active-key="currentTab"
      size="small"
      class="pro-detail-tabs"
    >
      <a-tab-pane v-for="tab in tabs" :key="tab.key" :tab="tab.label">
        <slot :name="`tab-${tab.key}`" />
      </a-tab-pane>
    </a-tabs>

    <!-- Default slot (when no tabs) -->
    <div v-if="!tabs?.length && $slots.default" class="pro-detail-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ProDescriptions from '../ProDescriptions/index.vue'
import type { ProDescriptionItem, ProDetailTab } from '@/types/pro'

interface Props {
  title?: string
  subTitle?: string
  tags?: Array<{ text: string; color?: string }>
  descriptions?: ProDescriptionItem[]
  data?: Record<string, any>
  descriptionColumn?: number
  tabs?: ProDetailTab[]
  activeTab?: string
}

const props = withDefaults(defineProps<Props>(), {
  descriptionColumn: 2
})

const emit = defineEmits(['update:activeTab'])

const currentTab = ref(props.activeTab || props.tabs?.[0]?.key || '')

watch(() => props.activeTab, (val) => {
  if (val) currentTab.value = val
})

watch(currentTab, (val) => {
  emit('update:activeTab', val)
})
</script>

<style scoped lang="scss">
.pro-detail {
  .pro-detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border-secondary, #f0f0f0);

    .pro-detail-header-main {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .pro-detail-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text);
    }

    .pro-detail-subtitle {
      font-size: 13px;
      color: var(--color-text-secondary);
    }
  }

  .pro-detail-descriptions {
    margin-bottom: 16px;
  }
}
</style>
