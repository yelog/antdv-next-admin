<template>
  <a-dropdown :trigger="['click']" placement="bottomRight" :menu="menuProps">
    <a-button type="text" class="header-action">
      <GlobalOutlined />
    </a-button>
  </a-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { GlobalOutlined } from '@antdv-next/icons'
import i18n, { setLocale } from '@/locales'

const currentLocale = computed(() => String(i18n.global.locale.value))
const localeOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

const handleLanguageChange = ({ key }: { key: string | number }) => {
  const nextLocale = String(key)
  if (!localeOptions.some(item => item.value === nextLocale)) {
    return
  }
  if (nextLocale === currentLocale.value) {
    return
  }
  setLocale(nextLocale)
}

const menuProps = computed(() => ({
  items: localeOptions.map(item => ({
    key: item.value,
    label: item.label
  })),
  selectedKeys: [currentLocale.value],
  onClick: handleLanguageChange
}))
</script>

<style scoped lang="scss">
:deep(.ant-menu-item-selected) {
  background: var(--color-primary-1);
  color: var(--color-primary);
}
</style>
