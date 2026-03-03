import { createI18n } from 'vue-i18n'
import type { I18n } from 'vue-i18n'

// Type definitions
type MessageSchema = Record<string, any>
type LocaleCode = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR'

// Supported locales configuration
export const SUPPORTED_LOCALES: LocaleCode[] = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR']

export const LOCALE_NATIVE_LABELS: Record<LocaleCode, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
  'ja-JP': '日本語',
  'ko-KR': '한국어'
}

// Locale file importers (lazy loading)
const localeLoaders: Record<LocaleCode, () => Promise<{ default: MessageSchema }>> = {
  'zh-CN': () => import('./zh-CN'),
  'en-US': () => import('./en-US'),
  'ja-JP': () => import('./ja-JP'),
  'ko-KR': () => import('./ko-KR')
}

// Track loaded locales
const loadedLocales = new Set<LocaleCode>()

// Create i18n instance with empty messages initially
const i18n: I18n<MessageSchema, {}, {}, string, false> = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {},
  globalInjection: true
})

/**
 * Load locale messages dynamically
 */
async function loadLocaleMessages(locale: LocaleCode): Promise<MessageSchema | null> {
  if (loadedLocales.has(locale)) {
    return i18n.global.messages.value[locale] as MessageSchema
  }

  try {
    const messages = await localeLoaders[locale]()
    i18n.global.setLocaleMessage(locale, messages.default)
    loadedLocales.add(locale)
    return messages.default
  } catch (error) {
    console.error(`Failed to load locale: ${locale}`, error)
    return null
  }
}

/**
 * Load locale synchronously (for initial render)
 */
function loadLocaleSync(locale: LocaleCode): void {
  if (loadedLocales.has(locale)) return

  // For the initial locale, we need to load it synchronously
  // This is handled by the sync imports below
}

/**
 * Set the current locale
 * @param locale - Target locale code
 * @param lazy - Whether to load asynchronously (default: true)
 */
export async function setLocale(locale: LocaleCode, lazy: boolean = true): Promise<void> {
  // Validate locale
  if (!SUPPORTED_LOCALES.includes(locale)) {
    console.warn(`Unsupported locale: ${locale}, falling back to zh-CN`)
    locale = 'zh-CN'
  }

  // Load messages if not already loaded
  if (lazy) {
    await loadLocaleMessages(locale)
  }

  // Set locale
  i18n.global.locale.value = locale
  localStorage.setItem('app-locale', locale)

  // Update HTML lang attribute
  document.documentElement.lang = locale

  // Set document title based on current route
  updateDocumentTitle()
}

/**
 * Get the current locale
 */
export function getLocale(): string {
  return i18n.global.locale.value
}

/**
 * Update document title with i18n
 */
function updateDocumentTitle(): void {
  const title = i18n.global.t('app.title')
  document.title = title || 'Antdv Next Admin'
}

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

/**
 * Preload a locale (useful for prefetching)
 */
export async function preloadLocale(locale: LocaleCode): Promise<void> {
  await loadLocaleMessages(locale)
}

/**
 * Check if a locale is loaded
 */
export function isLocaleLoaded(locale: LocaleCode): boolean {
  return loadedLocales.has(locale)
}

/**
 * Get all loaded locales
 */
export function getLoadedLocales(): LocaleCode[] {
  return Array.from(loadedLocales)
}

// Initialize with saved locale or default
const initializeI18n = async () => {
  const savedLocale = (localStorage.getItem('app-locale') || 'zh-CN') as LocaleCode

  // Load the initial locale
  await loadLocaleMessages(savedLocale)

  // Set the locale
  i18n.global.locale.value = savedLocale
  document.documentElement.lang = savedLocale

  // Preload fallback locale if different
  if (savedLocale !== 'zh-CN') {
    // Preload in background
    loadLocaleMessages('zh-CN').catch(() => {})
  }
}

// Start initialization
initializeI18n()

export default i18n