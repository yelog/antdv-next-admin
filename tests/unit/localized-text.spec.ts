import { describe, expect, it } from 'vitest';

import { resolveLocalizedText } from '@/utils/localizedText';

describe('resolveLocalizedText', () => {
  const localizedName = {
    'zh-CN': '角色管理',
    'en-US': 'Role Management',
    'ja-JP': 'ロール管理',
  };

  it('returns plain strings without modification', () => {
    expect(resolveLocalizedText('Dashboard', 'zh-CN')).toBe('Dashboard');
  });

  it('selects the current locale and never stringifies the object', () => {
    const label = `${resolveLocalizedText(localizedName, 'en-US')} (system.role.view)`;

    expect(label).toBe('Role Management (system.role.view)');
    expect(label).not.toContain('[object Object]');
  });

  it('falls back to Chinese, English, and then the first available value', () => {
    expect(resolveLocalizedText(localizedName, 'ko-KR')).toBe('角色管理');
    expect(resolveLocalizedText({ 'en-US': 'Role Management' }, 'ko-KR')).toBe('Role Management');
    expect(resolveLocalizedText({ custom: 'Custom role' }, 'ko-KR')).toBe('Custom role');
  });

  it('returns an empty string for empty values', () => {
    expect(resolveLocalizedText(undefined, 'zh-CN')).toBe('');
    expect(resolveLocalizedText(null, 'zh-CN')).toBe('');
    expect(resolveLocalizedText({}, 'zh-CN')).toBe('');
  });
});
