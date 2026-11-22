import { createPinia, disposePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSettingsStore } from '@/stores/settings';

const AI_ENTRY_KEY = 'layout-ai-entry-visible';
const AI_ENABLED_KEY = 'layout-ai-collab-enabled';
const AI_WIDTH_KEY = 'layout-ai-panel-width';
const ANIMATION_KEY = 'app-page-animation';

let pinia: ReturnType<typeof createPinia>;
let storage: Map<string, string>;
let browserWindow: EventTarget & { innerWidth: number };

beforeEach(() => {
  pinia = createPinia();
  storage = new Map();
  browserWindow = Object.assign(new EventTarget(), { innerWidth: 1280 });
  vi.stubGlobal('window', browserWindow);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
});

afterEach(() => {
  disposePinia(pinia);
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function createLayoutStore(demo: boolean) {
  vi.resetModules();
  vi.stubEnv('VITE_DEMO_MODE', String(demo));
  vi.stubEnv('VITE_USE_MOCK', 'true');
  const { useLayoutStore } = await import('@/stores/layout');
  return useLayoutStore(pinia);
}

describe('workspace motion preferences', () => {
  it('defaults to fade when there is no recognized saved preference', () => {
    const store = useSettingsStore(pinia);
    store.initSettings();
    expect(store.effectivePageAnimation).toBe('fade');
    expect(storage.has(ANIMATION_KEY)).toBe(false);

    storage.set(ANIMATION_KEY, 'invalid');
    store.initSettings();
    expect(store.effectivePageAnimation).toBe('fade');
  });

  it('restores the saved preference after reduced motion is turned off', () => {
    const media = Object.assign(new EventTarget(), { matches: true });
    const matchMedia = vi.fn(() => media);
    Object.assign(browserWindow, { matchMedia });
    storage.set(ANIMATION_KEY, 'zoom-big');

    const store = useSettingsStore(pinia);
    store.initSettings();
    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(store.pageAnimation).toBe('zoom-big');
    expect(store.effectivePageAnimation).toBe('none');

    store.setPageAnimation('slide-up');
    expect(store.effectivePageAnimation).toBe('none');
    expect(storage.get(ANIMATION_KEY)).toBe('slide-up');

    media.dispatchEvent(Object.assign(new Event('change'), { matches: false }));
    expect(store.effectivePageAnimation).toBe('slide-up');

    store.setPageAnimation('none');
    expect(store.effectivePageAnimation).toBe('none');
  });
});

describe('AI demo availability', () => {
  it('ignores old AI preferences and actions in a non-demo build even with mocks enabled', async () => {
    storage.set(AI_ENTRY_KEY, 'true');
    storage.set(AI_ENABLED_KEY, 'true');
    storage.set(AI_WIDTH_KEY, '500');
    const store = await createLayoutStore(false);
    store.initLayout();

    store.toggleAiCollab();
    store.setAiCollabEnabled(true);
    store.setAiEntryVisible(true);
    store.setAiPanelWidth(320);

    expect(store.canUseAiCollab).toBe(false);
    expect(store.aiEntryVisible).toBe(false);
    expect(store.aiCollabEnabled).toBe(false);
    expect(store.aiPanelWidth).toBe(420);
    expect(storage.get(AI_WIDTH_KEY)).toBe('500');
  });

  it('closes the demo on mobile and respects a hidden desktop entry', async () => {
    storage.set(AI_ENABLED_KEY, 'true');
    const store = await createLayoutStore(true);
    store.initLayout();
    expect(store.aiCollabEnabled).toBe(true);

    browserWindow.innerWidth = 390;
    browserWindow.dispatchEvent(new Event('resize'));
    store.toggleAiCollab();
    expect(store.canUseAiCollab).toBe(false);
    expect(store.aiCollabEnabled).toBe(false);
    expect(storage.get(AI_ENABLED_KEY)).toBe('false');

    browserWindow.innerWidth = 1280;
    browserWindow.dispatchEvent(new Event('resize'));
    store.setAiEntryVisible(false);
    store.toggleAiCollab();
    expect(store.canUseAiCollab).toBe(true);
    expect(store.aiCollabEnabled).toBe(false);
  });
});
