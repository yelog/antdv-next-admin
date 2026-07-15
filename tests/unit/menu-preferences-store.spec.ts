import { createPinia, setActivePinia } from 'pinia';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useMenuPreferencesStore } from '@/stores/menuPreferences';

function createMemoryStorage(initialValues: Record<string, string> = {}): Storage {
  const values = new Map(Object.entries(initialValues));

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

function installStorage(storage: Storage): void {
  vi.stubGlobal('window', { localStorage: storage });
  setActivePinia(createPinia());
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('menu preferences store', () => {
  it('migrates legacy tab favorites before persisting the dedicated preference', () => {
    const storage = createMemoryStorage({
      'app-tabs-state': JSON.stringify({
        tabs: [
          { path: '/dashboard', favorite: true },
          { path: '/system/users', favorite: false },
          { path: '/examples/form', favorite: true },
        ],
      }),
    });
    installStorage(storage);

    const store = useMenuPreferencesStore();

    expect(store.favoritePaths).toEqual(['/dashboard', '/examples/form']);
    expect(storage.getItem('app-menu-favorites')).toBe(
      JSON.stringify(['/dashboard', '/examples/form']),
    );
  });

  it('persists favorite and collection changes without resurrecting legacy favorites', () => {
    const storage = createMemoryStorage({
      'app-tabs-state': JSON.stringify({
        tabs: [{ path: '/dashboard', favorite: true }],
      }),
    });
    installStorage(storage);

    const store = useMenuPreferencesStore();
    store.toggleFavorite('/dashboard');
    store.setSearchView('favorites');

    expect(storage.getItem('app-menu-favorites')).toBe('[]');
    expect(storage.getItem('app-menu-search-view')).toBe('favorites');

    setActivePinia(createPinia());
    const restoredStore = useMenuPreferencesStore();

    expect(restoredStore.favoritePaths).toEqual([]);
    expect(restoredStore.searchView).toBe('favorites');
  });
});
