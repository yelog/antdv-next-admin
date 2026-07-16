import type { LocalizedText } from '@/types/auth';

export function resolveLocalizedText(
  value: string | LocalizedText | null | undefined,
  locale: string,
): string {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value[locale] || value['zh-CN'] || value['en-US'] || Object.values(value)[0] || '';
}
