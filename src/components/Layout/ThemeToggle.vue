<template>
  <a-tooltip :title="tooltipTitle">
    <a-button type="text" class="header-action" @click="themeStore.toggleTheme">
      <SunOutlined v-if="themeStore.isDark" />
      <MoonOutlined v-else />
    </a-button>
  </a-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SunOutlined, MoonOutlined } from '@ant-design/icons-vue'
import { useThemeStore } from '@/stores/theme'
import { useI18n } from 'vue-i18n'

const themeStore = useThemeStore()
const { t } = useI18n()

const tooltipTitle = computed(() => {
  return themeStore.isDark ? t('layout.theme') + ' (Light)' : t('layout.theme') + ' (Dark)'
})
</script>
