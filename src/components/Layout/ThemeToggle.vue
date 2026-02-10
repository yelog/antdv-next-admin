<template>
  <a-tooltip :title="tooltipTitle">
    <a-button type="text" class="header-action" @click="handleThemeToggle">
      <span class="theme-icon-wrapper" :class="{ rotating: isRotating }">
        <transition name="theme-icon-switch" mode="out-in">
          <MoonOutlined v-if="themeStore.isDark" key="moon" class="theme-icon" />
          <SunOutlined v-else key="sun" class="theme-icon" />
        </transition>
      </span>
    </a-button>
  </a-tooltip>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { MoonOutlined, SunOutlined } from '@antdv-next/icons'
import { useThemeStore } from '@/stores/theme'
import { useI18n } from 'vue-i18n'

const themeStore = useThemeStore()
const { t } = useI18n()
const isRotating = ref(false)
let rotateTimer: number | null = null

const tooltipTitle = computed(() => {
  return themeStore.isDark ? `${t('layout.theme')} (Light)` : `${t('layout.theme')} (Dark)`
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.theme-icon {
  font-size: 18px;
}

.theme-icon-wrapper.rotating .theme-icon {
  animation: icon-rotate 0.62s cubic-bezier(0.22, 1, 0.36, 1);
}

.theme-icon-switch-enter-active,
.theme-icon-switch-leave-active {
  transition: opacity 0.22s ease, transform 0.3s ease;
}

.theme-icon-switch-enter-from {
  opacity: 0;
  transform: scale(0.76);
}

.theme-icon-switch-leave-to {
  opacity: 0;
  transform: scale(1.14);
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

  .theme-icon-switch-enter-active,
  .theme-icon-switch-leave-active {
    transition: none;
  }
}
</style>
