<script setup lang="ts">
import type { ThemeConfig } from 'antdv-next'
import { theme as antdTheme } from 'antdv-next'
import { computed, onMounted } from 'vue'
import { appDefaultSettings } from './settings'
import { useNotificationStore } from './stores/notification'
import { useSettingsStore } from './stores/settings'
import { useThemeStore } from './stores/theme'
import { useWatermarkStore } from './stores/watermark'

const themeStore = useThemeStore()
const settingsStore = useSettingsStore()
const watermarkStore = useWatermarkStore()
const notificationStore = useNotificationStore()

const antdThemeConfig = computed<ThemeConfig>(() => ({
  algorithm: themeStore.isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: settingsStore.primaryColorHex,
    colorLink: settingsStore.primaryColorHex,
  },
}))

const inputConfig = computed(() => appDefaultSettings.input)
const selectConfig = computed(() => appDefaultSettings.select as any)
const datePickerConfig = computed(() => appDefaultSettings.datePicker as any)

onMounted(() => {
  // Initialize theme and settings from localStorage
  themeStore.initTheme()
  settingsStore.initSettings()
  watermarkStore.initWatermark()
  notificationStore.initNotifications()
})
</script>

<template>
  <a-config-provider
    :theme="antdThemeConfig"
    :input="inputConfig"
    :select="selectConfig"
    :date-picker="datePickerConfig"
    :range-picker="datePickerConfig"
  >
    <router-view />
  </a-config-provider>
</template>

<style>
#app {
  width: 100%;
  height: 100vh;
  font-family: var(--font-family);
  color: var(--color-text-primary);
  background-color: var(--color-bg-layout);
}
</style>
