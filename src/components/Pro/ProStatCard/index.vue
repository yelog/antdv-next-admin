<template>
  <article class="pro-stat-card">
    <div class="stat-heading">
      <p class="stat-label">{{ label }}</p>
      <span
        v-if="icon"
        class="stat-icon"
        :style="{ backgroundColor: accentColors[tone] }"
        aria-hidden="true"
      >
        <component :is="icon" />
      </span>
    </div>
    <p class="stat-value">{{ value }}</p>
    <p
      v-if="trend"
      class="stat-trend"
      :class="trendDirection === 'down' ? 'text-error' : 'text-success'"
    >
      <RiseOutlined v-if="trendDirection !== 'down'" aria-hidden="true" />
      <FallOutlined v-else aria-hidden="true" />
      <span>{{ trend }}</span>
    </p>
    <slot name="extra" />
  </article>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import type { ProStatCardTone } from "@/types/pro";

import { RiseOutlined, FallOutlined } from "@antdv-next/icons";

withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    trend?: string;
    trendDirection?: "up" | "down";
    icon?: Component;
    tone?: ProStatCardTone;
  }>(),
  {
    trendDirection: "up",
    tone: "blue",
  },
);

const accentColors: Record<ProStatCardTone, string> = {
  blue: "rgba(24, 119, 255, 0.12)",
  green: "rgba(82, 196, 26, 0.12)",
  orange: "rgba(250, 140, 22, 0.12)",
  purple: "rgba(114, 46, 209, 0.12)",
  red: "rgba(245, 34, 45, 0.12)",
  cyan: "rgba(19, 194, 194, 0.12)",
};
</script>

<style scoped>
.pro-stat-card {
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-lg);
  background: var(--color-bg-container);
}

.stat-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.stat-label {
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: var(--line-height-tight);
  overflow-wrap: anywhere;
}

.stat-icon {
  display: grid;
  flex: 0 0 24px;
  height: 24px;
  place-items: center;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 14px;
}

.stat-value {
  color: var(--color-text-primary);
  font-family: var(--font-family-number);
  font-size: clamp(1.375rem, 4vw, 1.75rem);
  font-weight: var(--font-weight-bold);
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.stat-trend {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 6px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}
</style>
