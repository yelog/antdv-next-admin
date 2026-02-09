import i18n from '@/locales'

export function resolveLocaleText(key?: string, fallback = ''): string {
  const safeFallback = fallback || '-'
  if (!key) {
    return safeFallback
  }

  const messageKey = String(key)
  if (i18n.global.te(messageKey as never)) {
    const translated = i18n.global.t(messageKey as never)
    if (typeof translated === 'string' && translated.trim()) {
      return translated
    }
  }

  return messageKey || safeFallback
}
