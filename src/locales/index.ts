import dayjs from 'dayjs';
import { createI18n } from 'vue-i18n';
import 'dayjs/locale/en';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/zh-cn';
import zhCN from './zh-CN';

type SupportedLocale = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR';
type AppLocaleMessages = typeof zhCN;
type LocaleRefLike = { value: string };

export const LOCALE_MESSAGES = {
  'zh-CN': zhCN,
};

const SUPPORTED_LOCALE_VALUES: SupportedLocale[] = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'];

export const SUPPORTED_LOCALES: string[] = [...SUPPORTED_LOCALE_VALUES];

export const LOCALE_NATIVE_LABELS: Record<string, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
  'ja-JP': '日本語',
  'ko-KR': '한국어',
};

function normalizeLocale(locale: string | null): SupportedLocale {
  return SUPPORTED_LOCALE_VALUES.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : 'zh-CN';
}

// Get saved locale or use default
const savedLocale = normalizeLocale(localStorage.getItem('app-locale'));

const localeLoaders: Record<SupportedLocale, () => Promise<AppLocaleMessages>> = {
  'zh-CN': () => Promise.resolve(zhCN),
  'en-US': () => import('./en-US').then((module) => module.default as unknown as AppLocaleMessages),
  'ja-JP': () => import('./ja-JP').then((module) => module.default as unknown as AppLocaleMessages),
  'ko-KR': () => import('./ko-KR').then((module) => module.default as unknown as AppLocaleMessages),
};

const loadedLocales = new Set<SupportedLocale>(['zh-CN']);

const DAYJS_LOCALE_MAP: Record<SupportedLocale, string> = {
  'zh-CN': 'zh-cn',
  'en-US': 'en',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
};

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'zh-CN',
  messages: LOCALE_MESSAGES,
  globalInjection: true,
});

document.documentElement.lang = savedLocale;
dayjs.locale(DAYJS_LOCALE_MAP[savedLocale]);

function setCurrentLocale(locale: SupportedLocale) {
  dayjs.locale(DAYJS_LOCALE_MAP[locale]);
  const currentLocale = i18n.global.locale as string | LocaleRefLike;
  if (typeof currentLocale === 'string') {
    (i18n.global as unknown as { locale: string }).locale = locale;
    return;
  }
  currentLocale.value = locale;
}

function getCurrentLocale(): string {
  const currentLocale = i18n.global.locale as string | LocaleRefLike;
  return typeof currentLocale === 'string' ? currentLocale : currentLocale.value;
}

export async function loadLocaleMessages(locale: string): Promise<SupportedLocale> {
  const targetLocale = normalizeLocale(locale);
  if (loadedLocales.has(targetLocale)) {
    return targetLocale;
  }

  const messages = await localeLoaders[targetLocale]();
  i18n.global.setLocaleMessage(targetLocale, messages);
  loadedLocales.add(targetLocale);
  return targetLocale;
}

void loadLocaleMessages(savedLocale);

type TranslateLike = (key: string, ...args: unknown[]) => unknown;

/**
 * Global i18n translate helper
 * Usage:
 * - template: {{ $t('common.search') }} (from globalInjection)
 * - <script setup> / ts: import { $t } from '@/locales'
 */
export function $t(key: string, ...args: unknown[]): string {
  const translate = i18n.global.t as unknown as TranslateLike;
  const result = translate(key, ...args);
  return typeof result === 'string' ? result : String(result);
}

export default i18n;

// Helper function to change locale
export async function setLocale(locale: string) {
  const targetLocale = await loadLocaleMessages(locale);
  setCurrentLocale(targetLocale);
  localStorage.setItem('app-locale', targetLocale);

  // Update HTML lang attribute
  document.documentElement.lang = targetLocale;
}

export function getLocale() {
  return getCurrentLocale();
}
