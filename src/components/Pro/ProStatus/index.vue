<script setup lang="ts">
import type { ProStatusMap, ProStatusMode } from '@/types/pro'
import { computed } from 'vue'

interface Props {
  value: string | number
  statusMap: ProStatusMap
  mode?: ProStatusMode
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'dot',
})

const config = computed(() => props.statusMap[String(props.value)])
const statusText = computed(() => config.value?.text ?? String(props.value))
const statusColor = computed(() => config.value?.color ?? '#8c8c8c')

const dotStyle = computed(() => {
  const c = statusColor.value
  return {
    '--pro-status-color': c,
    '--pro-status-bg': hexToRgba(c, 0.1),
  }
})

function hexToRgba(hex: string, alpha: number): string {
  // Handle named colors by returning a light background
  if (!hex.startsWith('#'))
    return `color-mix(in srgb, ${hex} ${alpha * 100}%, transparent)`
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
</script>

<template>
  <!-- Dot mode -->
  <span v-if="mode === 'dot'" class="pro-status pro-status-dot" :style="dotStyle">
    <span class="pro-status-dot-indicator" :style="{ background: statusColor }" />
    {{ statusText }}
  </span>

  <!-- Tag mode -->
  <a-tag v-else-if="mode === 'tag'" :color="statusColor">
    {{ statusText }}
  </a-tag>

  <!-- Badge mode -->
  <a-badge v-else :color="statusColor" :text="statusText" />
</template>

<style scoped lang="scss">
.pro-status-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 20px;
  color: var(--pro-status-color);
  background: var(--pro-status-bg);

  .pro-status-dot-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
}
</style>
