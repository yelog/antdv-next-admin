<template>
  <a-dropdown>
    <a-button type="text" class="header-action">
      <GlobalOutlined />
    </a-button>
    <template #overlay>
      <a-menu @click="handleLanguageChange">
        <a-menu-item key="zh-CN" :class="{ active: currentLocale === 'zh-CN' }">
          <span>简体中文</span>
        </a-menu-item>
        <a-menu-item key="en-US" :class="{ active: currentLocale === 'en-US' }">
          <span>English</span>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { GlobalOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/locales'

const { locale } = useI18n()

const currentLocale = computed(() => locale.value)

const handleLanguageChange = ({ key }: { key: string }) => {
  setLocale(key)
}
</script>

<style scoped lang="scss">
:deep(.ant-menu-item.active) {
  background: var(--color-primary-1);
  color: var(--color-primary);
}
</style>
