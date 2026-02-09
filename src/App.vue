<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from './stores/theme'
import { useSettingsStore } from './stores/settings'

const themeStore = useThemeStore()
const settingsStore = useSettingsStore()

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
