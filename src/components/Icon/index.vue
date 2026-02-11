<template>
  <component
    :is="antdvComp"
    v-if="resolvedKind === 'antdv-next'"
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
    v-else
    class="app-icon"
    :icon="iconifyIcon"
    :style="[baseStyle, props.style]"
  />
</template>

<script setup lang="ts">
import type { StyleValue } from 'vue'
import { computed } from 'vue'
import { Icon as IconifyIcon } from '@iconify/vue'
import * as AntdvIcons from '@antdv-next/icons'

type NormalizedIconKind = 'iconify' | 'antdv-next' | 'svg'
type IconKind = NormalizedIconKind | 'antdvNext' | 'antd'

interface Props {
  icon: string
  kind?: IconKind
  size?: number | string
  style?: StyleValue
}

const props = withDefaults(defineProps<Props>(), {
  size: 16
})

const stripPrefix = (value: string, prefix: string) => {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value
}

const normalizeKind = (kind?: IconKind): NormalizedIconKind | undefined => {
  if (!kind) {
    return undefined
  }
  if (kind === 'antdvNext' || kind === 'antd') {
    return 'antdv-next'
  }
  return kind
}

const iconText = computed(() => props.icon.trim())

const resolvedKind = computed<NormalizedIconKind>(() => {
  const forcedKind = normalizeKind(props.kind)
  if (forcedKind) {
    return forcedKind
  }

  if (iconText.value.startsWith('antdv-next:') || iconText.value.startsWith('antd:')) {
    return 'antdv-next'
  }

  if (iconText.value.startsWith('svg:')) {
    return 'svg'
  }

  return 'iconify'
})

const antdvKey = computed(() => {
  return stripPrefix(stripPrefix(iconText.value, 'antdv-next:'), 'antd:')
})

const antdvComp = computed(() => {
  const icons = AntdvIcons as Record<string, unknown>
  return icons[antdvKey.value] || icons.QuestionOutlined
})

const svgId = computed(() => stripPrefix(iconText.value, 'svg:'))

const iconifyIcon = computed(() => stripPrefix(iconText.value, 'iconify:'))

const sizeCss = computed(() => {
  return typeof props.size === 'number' ? `${props.size}px` : props.size
})

const baseStyle = computed(() => ({
  width: sizeCss.value,
  height: sizeCss.value,
  lineHeight: sizeCss.value,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
}))
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
