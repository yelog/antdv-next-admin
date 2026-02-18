import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'
import jaJP from './ja-JP'
import koKR from './ko-KR'

export const LOCALE_MESSAGES = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,
  'ko-KR': koKR
}

export const SUPPORTED_LOCALES = Object.keys(LOCALE_MESSAGES) as string[]

// Get saved locale or use default
const savedLocale = localStorage.getItem('app-locale') || 'zh-CN'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'zh-CN',
  messages: LOCALE_MESSAGES,
  globalInjection: true
})

document.documentElement.lang = savedLocale

type TranslateLike = (key: string, ...args: any[]) => unknown

/**
 * Global i18n translate helper
 * Usage:
 * - template: {{ $t('common.search') }} (from globalInjection)
 * - <script setup> / ts: import { $t } from '@/locales'
 */
export function $t(key: string, ...args: any[]): string {
  const translate = i18n.global.t as unknown as TranslateLike
  const result = translate(key, ...args)
  return typeof result === 'string' ? result : String(result)
}

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
