<template>
  <a-config-provider
    :theme="antdThemeConfig"
    :input="inputConfig"
    :select="selectConfig"
    :date-picker="datePickerConfig"
    :range-picker="datePickerConfig"
    :button="buttonConfig"
    :locale="antdLocale"
  >
    <a-app>
      <router-view />
    </a-app>
  </a-config-provider>
</template>

<script setup lang="ts">
import { App as AntApp, ConfigProvider, theme as antdTheme, type ThemeConfig } from 'antdv-next';
import enUS from 'antdv-next/dist/locale/en_US';
import jaJP from 'antdv-next/dist/locale/ja_JP';
import koKR from 'antdv-next/dist/locale/ko_KR';
import zhCN from 'antdv-next/dist/locale/zh_CN';
import { computed, h, onMounted, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { appDefaultSettings } from './settings';
import { useNotificationStore } from './stores/notification';
import { useSettingsStore } from './stores/settings';
import { useThemeStore } from './stores/theme';
import { useWatermarkStore } from './stores/watermark';

const themeStore = useThemeStore();
const settingsStore = useSettingsStore();
const watermarkStore = useWatermarkStore();
const notificationStore = useNotificationStore();
const { locale } = useI18n();

const antdLocaleMap = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,
  'ko-KR': koKR,
};

const antdThemeConfig = computed<ThemeConfig>(() => ({
  algorithm: themeStore.isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: settingsStore.primaryColorHex,
    colorLink: settingsStore.primaryColorHex,
  },
}));

const inputConfig = computed(() => appDefaultSettings.input);
const selectConfig = computed(
  () => appDefaultSettings.select as unknown as Record<string, unknown>,
);
const datePickerConfig = computed(
  () => appDefaultSettings.datePicker as unknown as Record<string, unknown>,
);
const buttonConfig = computed(() => appDefaultSettings.button);
const antdLocale = computed(() => {
  return antdLocaleMap[locale.value as keyof typeof antdLocaleMap] ?? zhCN;
});

watchEffect(() => {
  const currentTheme = antdThemeConfig.value;
  const currentLocale = antdLocale.value;

  ConfigProvider.config({
    holderRender: (children) =>
      h(
        ConfigProvider,
        {
          locale: currentLocale,
          theme: currentTheme,
        },
        () => h(AntApp, null, () => children),
      ),
  });
});

notificationStore.initNotifications();

onMounted(() => {
  // Initialize theme and settings from localStorage
  themeStore.initTheme();
  settingsStore.initSettings();
  watermarkStore.initWatermark();
});
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
