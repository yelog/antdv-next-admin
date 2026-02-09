import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

// Get saved locale or use default
const savedLocale = localStorage.getItem('app-locale') || 'zh-CN'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'zh-CN',
  messages,
  globalInjection: true
})

export default i18n

// Helper function to change locale
export function setLocale(locale: string) {
  i18n.global.locale.value = locale as any
  localStorage.setItem('app-locale', locale)

  // Update HTML lang attribute
  document.documentElement.lang = locale
}

export function getLocale() {
  return i18n.global.locale.value
}
