<script setup lang="ts">
import { GlobalOutlined } from '@antdv-next/icons'
import { computed } from 'vue'
import i18n, { LOCALE_NATIVE_LABELS, setLocale } from '@/locales'

const currentLocale = computed(() => String(i18n.global.locale.value))
const localeOptions = computed(() => ([
  { label: LOCALE_NATIVE_LABELS['zh-CN'], value: 'zh-CN' },
  { label: LOCALE_NATIVE_LABELS['en-US'], value: 'en-US' },
  { label: LOCALE_NATIVE_LABELS['ja-JP'], value: 'ja-JP' },
  { label: LOCALE_NATIVE_LABELS['ko-KR'], value: 'ko-KR' },
]))

function handleLanguageChange({ key }: { key: string | number }) {
  const nextLocale = String(key)
  if (!localeOptions.value.some(item => item.value === nextLocale)) {
    return
  }
  if (nextLocale === currentLocale.value) {
    return
  }
  setLocale(nextLocale)
}

const menuProps = computed(() => ({
  items: localeOptions.value.map(item => ({
    key: item.value,
    label: item.label,
  })),
  selectedKeys: [currentLocale.value],
  onClick: handleLanguageChange,
}))
</script>

<template>
  <a-dropdown :trigger="['click']" placement="bottomRight" :menu="menuProps">
    <a-button type="text" class="header-action">
      <GlobalOutlined />
    </a-button>
  </a-dropdown>
</template>

<style scoped lang="scss">
:deep(.ant-menu-item-selected) {
  background: var(--color-primary-1);
  color: var(--color-primary);
}
</style>
