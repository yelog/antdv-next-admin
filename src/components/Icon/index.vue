<template>
  <component
    :is="antdvComp"
    v-if="resolvedKind === 'antdv-next' && antdvComp"
    class="app-icon"
    :style="[baseStyle, props.style]"
  />

  <svg
    v-else-if="resolvedKind === 'svg'"
    class="app-icon app-icon-svg"
    :style="[baseStyle, props.style]"
    aria-hidden="true"
  >
    <use :href="`#${svgId}`" />
  </svg>

  <IconifyIcon
    v-else-if="canRenderIconify"
    class="app-icon"
    :icon="iconifyIcon"
    :style="[baseStyle, props.style]"
  />

  <span v-else class="app-icon" :style="[baseStyle, props.style]" />
</template>

<script setup lang="ts">
import type { Component, StyleValue } from 'vue';

import { Icon as IconifyIcon } from '@iconify/vue';
import { computed, ref, shallowRef, watch } from 'vue';

import { isLocalIconifyPrefix, loadLocalIconifySet } from '@/utils/iconify';
import { parseIconName } from '@/utils/iconName';

type NormalizedIconKind = 'iconify' | 'antdv-next' | 'svg';
type IconKind = NormalizedIconKind | 'antdvNext' | 'antd';

interface Props {
  icon: string;
  kind?: IconKind;
  size?: number | string;
  style?: StyleValue;
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
});

const stripPrefix = (value: string, prefix: string) => {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
};

const normalizeKind = (kind?: IconKind): NormalizedIconKind | undefined => {
  if (!kind) {
    return undefined;
  }
  if (kind === 'antdvNext' || kind === 'antd') {
    return 'antdv-next';
  }
  return kind;
};

const iconText = computed(() => props.icon.trim());
const parsedIcon = computed(() => parseIconName(iconText.value));

const resolvedKind = computed<NormalizedIconKind>(() => {
  const forcedKind = normalizeKind(props.kind);
  if (forcedKind) {
    return forcedKind;
  }

  return parsedIcon.value?.kind || 'iconify';
});

const antdvKey = computed(() => {
  if (parsedIcon.value?.kind === 'antdv-next') {
    return parsedIcon.value.value;
  }
  return stripPrefix(stripPrefix(iconText.value, 'antdv-next:'), 'antd:');
});

const antdvComp = shallowRef<Component>();
const localIconifyReady = ref(true);

watch(
  [resolvedKind, antdvKey],
  async ([kind, key]) => {
    if (kind !== 'antdv-next') {
      antdvComp.value = undefined;
      return;
    }

    const icons = (await import('@antdv-next/icons')) as Record<string, Component>;
    antdvComp.value = icons[key];
  },
  {
    immediate: true,
  },
);

const svgId = computed(() =>
  parsedIcon.value?.kind === 'svg' ? parsedIcon.value.value : stripPrefix(iconText.value, 'svg:'),
);

const iconifyIcon = computed(() =>
  parsedIcon.value?.kind === 'iconify'
    ? parsedIcon.value.value
    : stripPrefix(iconText.value, 'iconify:'),
);

const iconifyPrefix = computed(() => {
  const [prefix] = iconifyIcon.value.split(':');
  return prefix || '';
});

const canRenderIconify = computed(() => {
  return resolvedKind.value === 'iconify' && localIconifyReady.value;
});

watch(
  [resolvedKind, iconifyPrefix],
  async ([kind, prefix]) => {
    if (kind !== 'iconify' || !isLocalIconifyPrefix(prefix)) {
      localIconifyReady.value = true;
      return;
    }

    localIconifyReady.value = false;
    await loadLocalIconifySet(prefix);
    if (resolvedKind.value === 'iconify' && iconifyPrefix.value === prefix) {
      localIconifyReady.value = true;
    }
  },
  {
    immediate: true,
  },
);

const sizeCss = computed(() => {
  return typeof props.size === 'number' ? `${props.size}px` : props.size;
});

const baseStyle = computed(() => ({
  width: sizeCss.value,
  height: sizeCss.value,
  lineHeight: sizeCss.value,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}));
</script>

<style scoped lang="scss">
.app-icon {
  display: inline-block;
  min-width: 1em;
  min-height: 1em;
  vertical-align: -0.125em;
  flex-shrink: 0;
}

.app-icon-svg {
  fill: currentColor;
}
</style>
