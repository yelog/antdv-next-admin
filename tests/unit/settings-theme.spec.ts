import { createPinia, setActivePinia } from 'pinia';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useSettingsStore } from '@/stores/settings';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('settings theme colors', () => {
  it('removes custom inline color variables when switching to a preset', () => {
    const setProperty = vi.fn();
    const removeProperty = vi.fn();
    const setAttribute = vi.fn();
    const removeAttribute = vi.fn();

    vi.stubGlobal('document', {
      documentElement: {
        setAttribute,
        removeAttribute,
        style: { setProperty, removeProperty },
      },
    });
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    setActivePinia(createPinia());

    const store = useSettingsStore();
    store.setCustomPrimaryColor('#ff00aa');
    removeProperty.mockClear();

    store.setPrimaryColor('green');

    expect(removeProperty.mock.calls.map(([property]) => property)).toEqual([
      '--color-primary',
      ...Array.from({ length: 10 }, (_, index) => `--color-primary-${index + 1}`),
    ]);
    expect(setAttribute).toHaveBeenLastCalledWith('data-primary-color', 'green');
    expect(setProperty).toHaveBeenLastCalledWith('--ant-primary-color', '#52c41a');
    expect(store.customPrimaryColor).toBe('');
    expect(store.primaryColorHex).toBe('#52c41a');
  });
});
