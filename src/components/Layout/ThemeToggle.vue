<template>
  <a-tooltip :title="tooltipTitle">
    <a-button type="text" class="header-action" @click="handleThemeToggle">
      <span class="theme-icon-wrapper" :class="{ rotating: isRotating }">
        <MoonOutlined class="theme-icon theme-icon-dark" :class="{ active: themeStore.isDark }" />
        <SunOutlined class="theme-icon theme-icon-light" :class="{ active: !themeStore.isDark }" />
      </span>
    </a-button>
  </a-tooltip>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { MoonOutlined, SunOutlined } from '@antdv-next/icons'
import { useThemeStore } from '@/stores/theme'
import { $t } from '@/locales'

const themeStore = useThemeStore()
const isRotating = ref(false)
let rotateTimer: number | null = null

const tooltipTitle = computed(() => {
  return themeStore.isDark ? `${$t('layout.theme')} (Light)` : `${$t('layout.theme')} (Dark)`
})

const resetRotateState = () => {
  if (rotateTimer !== null) {
    window.clearTimeout(rotateTimer)
    rotateTimer = null
  }
  isRotating.value = false
}

const handleThemeToggle = (event: MouseEvent) => {
  resetRotateState()
  isRotating.value = true
  rotateTimer = window.setTimeout(() => {
    isRotating.value = false
    rotateTimer = null
  }, 620)

  themeStore.setTheme(themeStore.isDark ? 'light' : 'dark', {
    origin: {
      x: event.clientX,
      y: event.clientY
    }
  })
}

onBeforeUnmount(resetRotateState)
</script>

<style scoped lang="scss">
.theme-icon-wrapper {
  display: inline-grid;
  place-items: center;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-icon-wrapper:hover {
  transform: rotate(90deg);
}

.theme-icon {
  grid-area: 1 / 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.85);
  transition: opacity 0.22s ease, transform 0.3s ease;
}

.theme-icon.active {
  opacity: 1;
  transform: scale(1);
}

.theme-icon-wrapper.rotating .theme-icon {
  animation: icon-rotate 0.62s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes icon-rotate {
  0% {
    transform: rotate(0deg) scale(1);
  }
  55% {
    transform: rotate(170deg) scale(1.05);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .theme-icon-wrapper.rotating .theme-icon {
    animation: none;
  }

  .theme-icon,
  .theme-icon-wrapper {
    transition: none;
  }
}
</style>
