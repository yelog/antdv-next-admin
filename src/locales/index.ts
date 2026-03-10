import { createI18n } from "vue-i18n";

import enUS from "./en-US";
import jaJP from "./ja-JP";
import koKR from "./ko-KR";
import zhCN from "./zh-CN";

export const LOCALE_MESSAGES = {
  "zh-CN": zhCN,
  "en-US": enUS,
  "ja-JP": jaJP,
  "ko-KR": koKR,
};

export const SUPPORTED_LOCALES = Object.keys(LOCALE_MESSAGES) as string[];

export const LOCALE_NATIVE_LABELS: Record<string, string> = {
  "zh-CN": "简体中文",
  "en-US": "English",
  "ja-JP": "日本語",
  "ko-KR": "한국어",
};

// Get saved locale or use default
const savedLocale = localStorage.getItem("app-locale") || "zh-CN";

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: "zh-CN",
  messages: LOCALE_MESSAGES,
  globalInjection: true,
});

document.documentElement.lang = savedLocale;

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
  return typeof result === "string" ? result : String(result);
}

export default i18n;

// Helper function to change locale
export function setLocale(locale: string) {
  i18n.global.locale.value = locale as "zh-CN" | "en-US" | "ja-JP" | "ko-KR";
  localStorage.setItem("app-locale", locale);

  // Update HTML lang attribute
  document.documentElement.lang = locale;
}

export function getLocale() {
  return i18n.global.locale.value;
}
