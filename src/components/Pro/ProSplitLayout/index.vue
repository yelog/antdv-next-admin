<template>
  <div class="pro-split-layout" :style="layoutStyle">
    <div class="pro-split-side" :style="sideStyle">
      <slot name="side" />
    </div>
    <div class="pro-split-main">
      <slot name="main" />
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  sideWidth?: number | string
  sidePosition?: 'left' | 'right'
  gap?: number | string
}>(), {
  sideWidth: 280,
  sidePosition: 'left',
  gap: 16
})

const normalizeSize = (value: number | string) => {
  return typeof value === 'number' ? `${value}px` : value
}

const layoutStyle = computed(() => ({
  gap: normalizeSize(props.gap),
  flexDirection: props.sidePosition === 'right' ? 'row-reverse' as const : 'row' as const
}))

const sideStyle = computed(() => ({
  width: normalizeSize(props.sideWidth),
  minWidth: normalizeSize(props.sideWidth)
}))
</script>

<style scoped lang="scss">
.pro-split-layout {
  display: flex;
  flex: 1;
  min-height: 0;
}

.pro-split-side {
  flex-shrink: 0;
  background: var(--color-bg-container);
  border-radius: 8px;
  padding: 20px 16px 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.pro-split-main {
  flex: 1;
  background: var(--color-bg-container);
  border-radius: 8px;
  padding: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-width: 0;
}
</style>
