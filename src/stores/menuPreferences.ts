import type { MenuHistoryItem, MenuSearchView } from '@/types/navigation';

import { defineStore } from 'pinia';
import { ref } from 'vue';

import {
  parseMenuHistory,
  resolveStoredFavoritePaths,
  resolveStoredMenuSearchView,
} from '@/utils/menuPreferences';

const MENU_FAVORITES_STORAGE_KEY = 'app-menu-favorites';
const MENU_SEARCH_VIEW_STORAGE_KEY = 'app-menu-search-view';
const LEGACY_TABS_STORAGE_KEY = 'app-tabs-state';
const MENU_HISTORY_KEY = 'app-menu-history';
export const MENU_HISTORY_LIMIT = 10;

function readStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Keep the in-memory preference usable when storage is unavailable.
  }
}

export const useMenuPreferencesStore = defineStore('menu-preferences', () => {
  const rawFavoritePaths = readStorageItem(MENU_FAVORITES_STORAGE_KEY);
  const initialFavoritePaths = resolveStoredFavoritePaths(
    rawFavoritePaths,
    readStorageItem(LEGACY_TABS_STORAGE_KEY),
  );
  const favoritePaths = ref<string[]>(initialFavoritePaths);
  const searchView = ref<MenuSearchView>(
    resolveStoredMenuSearchView(readStorageItem(MENU_SEARCH_VIEW_STORAGE_KEY)),
  );
  const history = ref(parseMenuHistory(readStorageItem(MENU_HISTORY_KEY)));

  function refreshHistory(): void {
    history.value = parseMenuHistory(readStorageItem(MENU_HISTORY_KEY));
  }

  function recordVisit(visit: MenuHistoryItem): void {
    const saved = readStorageItem(MENU_HISTORY_KEY);
    const previous = saved === null ? history.value : parseMenuHistory(saved);
    history.value = [visit, ...previous.filter((entry) => entry.path !== visit.path)].slice(
      0,
      MENU_HISTORY_LIMIT,
    );
    writeStorageItem(MENU_HISTORY_KEY, JSON.stringify(history.value));
  }

  function clearHistory(): void {
    history.value = [];
    writeStorageItem(MENU_HISTORY_KEY, '[]');
  }

  const normalizedFavoritePaths = JSON.stringify(initialFavoritePaths);
  if (rawFavoritePaths !== normalizedFavoritePaths) {
    writeStorageItem(MENU_FAVORITES_STORAGE_KEY, normalizedFavoritePaths);
  }

  const isFavorite = (path: string): boolean => favoritePaths.value.includes(path);

  const toggleFavorite = (path: string): void => {
    const normalizedPath = path.trim();
    if (!normalizedPath) return;

    if (isFavorite(normalizedPath)) {
      favoritePaths.value = favoritePaths.value.filter((item) => item !== normalizedPath);
    } else {
      favoritePaths.value = [normalizedPath, ...favoritePaths.value];
    }

    writeStorageItem(MENU_FAVORITES_STORAGE_KEY, JSON.stringify(favoritePaths.value));
  };

  const setSearchView = (view: MenuSearchView): void => {
    searchView.value = view;
    writeStorageItem(MENU_SEARCH_VIEW_STORAGE_KEY, view);
  };

  return {
    favoritePaths,
    searchView,
    history,
    refreshHistory,
    recordVisit,
    clearHistory,
    isFavorite,
    toggleFavorite,
    setSearchView,
  };
});
