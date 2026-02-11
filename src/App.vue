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

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { theme as antdTheme, type ThemeConfig } from 'antdv-next'
import { useThemeStore } from './stores/theme'
import { useSettingsStore } from './stores/settings'
import { appDefaultSettings } from './settings'

const themeStore = useThemeStore()
const settingsStore = useSettingsStore()

const antdThemeConfig = computed<ThemeConfig>(() => ({
  algorithm: themeStore.isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: settingsStore.primaryColorHex
  }
}))

const inputConfig = computed(() => appDefaultSettings.input)
const selectConfig = computed(() => appDefaultSettings.select as any)
const datePickerConfig = computed(() => appDefaultSettings.datePicker as any)

onMounted(() => {
  // Initialize theme and settings from localStorage
  themeStore.initTheme()
  settingsStore.initSettings()
})
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
  font-family: var(--font-family);
  color: var(--color-text-primary);
  background-color: var(--color-bg-layout);
}
</style>
