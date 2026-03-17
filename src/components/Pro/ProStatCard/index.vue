<template>
  <article
    class="relative overflow-hidden min-h-[168px] !p-5 rounded-[var(--radius-lg)] border border-[var(--color-border-secondary)] bg-[var(--color-bg-container)] shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] md:min-h-[150px]"
  >
    <p class="text-xs text-[var(--color-text-tertiary)] mb-2.5">{{ label }}</p>
    <p
      class="m-0 text-4xl leading-none font-[var(--font-family-number)] font-bold text-[var(--color-text-primary)] tracking-tight md:text-3xl"
    >
      {{ value }}
    </p>
    <p
      v-if="trend"
      class="mt-3.5 inline-flex items-center gap-1.5 text-xs font-medium"
      :class="trendDirection === 'down' ? 'text-error' : 'text-success'"
    >
      <RiseOutlined v-if="trendDirection !== 'down'" />
      <FallOutlined v-else />
      <span>{{ trend }}</span>
    </p>
    <slot name="extra" />
    <component
      :is="icon"
      v-if="icon"
      class="absolute right-3.5 -bottom-1.5 text-[96px]"
      :style="{ color: accentColor }"
    />
  </article>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import type { ProStatCardTone } from "@/types/pro";

import { computed } from "vue";
import { RiseOutlined, FallOutlined } from "@antdv-next/icons";

const props = withDefaults(
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

const accentColor = computed(() => accentColors[props.tone]);
</script>