<template>
  <article class="pro-stat-card" :class="`tone-${tone}`">
    <p class="stat-label">{{ label }}</p>
    <p class="stat-value">{{ value }}</p>
    <p v-if="trend" class="stat-trend" :class="{ 'trend-down': trendDirection === 'down' }">
      <RiseOutlined v-if="trendDirection !== 'down'" />
      <FallOutlined v-else />
      <span>{{ trend }}</span>
    </p>
    <slot name="extra" />
    <component :is="icon" v-if="icon" class="stat-watermark" />
  </article>
</template>

<script setup lang="ts">
import { RiseOutlined, FallOutlined } from '@antdv-next/icons'
import type { ProStatCardTone } from '@/types/pro'

withDefaults(defineProps<{
  label: string
  value: string | number
  trend?: string
  trendDirection?: 'up' | 'down'
  icon?: any
  tone?: ProStatCardTone
}>(), {
  trendDirection: 'up',
  tone: 'blue'
})
</script>

<style scoped lang="scss">
.pro-stat-card {
  position: relative;
  overflow: hidden;
  min-height: 168px;
  padding: 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-secondary);
  background: var(--color-bg-container);
  box-shadow: var(--shadow-card);
  transition: all var(--duration-slow) var(--ease-out);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover);
  }

  .stat-label {
    font-size: 12px;
    color: var(--color-text-tertiary);
    margin-bottom: 10px;
  }

  .stat-value {
    margin: 0;
    font-size: 36px;
    line-height: 1;
    font-family: var(--font-family-number);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
  }

  .stat-trend {
    margin-top: 14px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--color-success);
    font-weight: var(--font-weight-medium);

    &.trend-down {
      color: var(--color-error, #ff4d4f);
    }
  }

  .stat-watermark {
    position: absolute;
    right: 14px;
    bottom: -6px;
    font-size: 96px;
    color: var(--accent-soft);
  }

  &.tone-blue {
    --accent-soft: rgba(24, 119, 255, 0.12);
  }

  &.tone-green {
    --accent-soft: rgba(82, 196, 26, 0.12);
  }

  &.tone-orange {
    --accent-soft: rgba(250, 140, 22, 0.12);
  }

  &.tone-purple {
    --accent-soft: rgba(114, 46, 209, 0.12);
  }

  &.tone-red {
    --accent-soft: rgba(245, 34, 45, 0.12);
  }

  &.tone-cyan {
    --accent-soft: rgba(19, 194, 194, 0.12);
  }
}

@media (max-width: 768px) {
  .pro-stat-card {
    min-height: 150px;

    .stat-value {
      font-size: 32px;
    }
  }
}
</style>
