import { $t } from '@/locales'

export function resolveLocaleText(key?: string, fallback = ''): string {
  const safeFallback = fallback || '-'
  if (!key) {
    return safeFallback
  }

  const messageKey = String(key)
  const translated = $t(messageKey)
  if (translated !== messageKey && translated.trim()) {
    return translated
  }

  return messageKey || safeFallback
}
