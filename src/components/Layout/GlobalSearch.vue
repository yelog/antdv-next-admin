<template>
  <Teleport to="body">
    <Transition name="search-modal">
      <div v-if="visible" class="global-search-overlay" @click="close">
        <div
          ref="searchContentRef"
          class="global-search-content"
          role="dialog"
          aria-modal="true"
          :aria-label="$t('layout.menuSearchDialog')"
          @click.stop
        >
          <div class="search-input-wrapper">
            <SearchOutlined class="search-icon" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="search-input"
              :placeholder="$t('layout.searchPlaceholder')"
              :aria-label="$t('layout.searchPlaceholder')"
              aria-describedby="global-search-active-item"
              autocomplete="off"
              @keydown="handleKeydown"
            />
            <button
              type="button"
              class="search-tag"
              :aria-label="$t('common.close')"
              @click="close"
            >
              ESC
            </button>
          </div>
          <span
            id="global-search-active-item"
            class="visually-hidden"
            aria-live="polite"
            aria-atomic="true"
          >
            {{ activeItemLabel }}
          </span>

          <div ref="searchBodyRef" class="search-body">
            <div v-if="!hasSearchQuery" class="search-collection-toolbar">
              <a-segmented
                :value="activeView"
                :options="collectionOptions"
                name="global-search-collection"
                size="small"
                :aria-label="$t('layout.menuSearchCollections')"
                @change="handleCollectionChange"
              />
              <a-button
                v-if="activeView === 'recent' && recentItems.length > 0"
                type="link"
                size="small"
                class="clear-btn"
                :aria-label="$t('layout.clearRecentMenus')"
                @click="clearHistory"
              >
                {{ $t('common.clear') }}
              </a-button>
            </div>

            <!-- Search Results -->
            <div v-if="hasSearchQuery" class="search-results">
              <div v-if="searchResults.length > 0">
                <div
                  v-for="(result, index) in searchResults"
                  :key="result.path"
                  class="search-item"
                  :class="{ active: index === activeIndex }"
                  @mouseenter="activeIndex = index"
                >
                  <button
                    type="button"
                    class="item-main"
                    @click="handleResultClick(result)"
                    @focus="activeIndex = index"
                  >
                    <span class="item-icon">
                      <component :is="getIconComponent(result.icon)" v-if="result.icon" />
                      <FileOutlined v-else />
                    </span>
                    <span class="item-info">
                      <span
                        class="item-title"
                        v-html="highlightText(result.title, normalizedSearchQuery)"
                      ></span>
                      <span
                        class="item-path"
                        v-html="highlightText(formatPath(result.path), normalizedSearchQuery)"
                      ></span>
                    </span>
                  </button>
                  <div class="item-actions" @click.stop>
                    <a-button
                      type="text"
                      size="small"
                      class="favorite-btn"
                      :aria-label="favoriteActionLabel(result.path)"
                      :aria-pressed="isFavorite(result.path)"
                      :title="favoriteActionLabel(result.path)"
                      @click="toggleFavorite(result.path)"
                    >
                      <StarFilled v-if="isFavorite(result.path)" class="favorite-icon active" />
                      <StarOutlined v-else class="favorite-icon" />
                    </a-button>
                  </div>
                  <EnterOutlined class="item-enter" aria-hidden="true" />
                </div>
              </div>
              <div v-else class="search-empty">
                <div class="empty-icon">
                  <SearchOutlined />
                </div>
                <p>{{ $t('layout.noSearchResults') }}</p>
              </div>
            </div>

            <!-- Recent Visits / Favorites -->
            <div v-else-if="activeCollectionItems.length > 0" class="search-results">
              <div
                v-for="(item, index) in activeCollectionItems"
                :key="item.path"
                class="search-item"
                :class="{ active: index === activeIndex }"
                @mouseenter="activeIndex = index"
              >
                <button
                  type="button"
                  class="item-main"
                  @click="handleItemClick(item)"
                  @focus="activeIndex = index"
                >
                  <span class="item-icon">
                    <component :is="getIconComponent(item.icon)" v-if="item.icon" />
                    <FileOutlined v-else />
                  </span>
                  <span class="item-info">
                    <span class="item-title">{{ item.title }}</span>
                    <span class="item-path">{{ formatPath(item.path) }}</span>
                  </span>
                </button>
                <div class="item-actions" @click.stop>
                  <a-button
                    type="text"
                    size="small"
                    class="favorite-btn"
                    :aria-label="favoriteActionLabel(item.path)"
                    :aria-pressed="isFavorite(item.path)"
                    :title="favoriteActionLabel(item.path)"
                    @click="toggleFavorite(item.path)"
                  >
                    <StarFilled v-if="isFavorite(item.path)" class="favorite-icon active" />
                    <StarOutlined v-else class="favorite-icon" />
                  </a-button>
                </div>
                <EnterOutlined class="item-enter" aria-hidden="true" />
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="search-empty">
              <div class="empty-icon">
                <StarOutlined v-if="activeView === 'favorites'" />
                <ClockCircleOutlined v-else />
              </div>
              <strong class="empty-title">
                {{
                  activeView === 'favorites'
                    ? $t('layout.favoriteMenusEmpty')
                    : $t('layout.recentMenusEmpty')
                }}
              </strong>
              <p>
                {{
                  activeView === 'favorites'
                    ? $t('layout.favoriteMenusEmptyHint')
                    : $t('layout.recentMenusEmptyHint')
                }}
              </p>
            </div>
          </div>

          <div class="search-footer">
            <div class="footer-item">
              <span class="key-badge">
                <ArrowUpOutlined />
              </span>
              <span class="key-badge">
                <ArrowDownOutlined />
              </span>
              <span class="footer-text">{{ $t('common.navigate') }}</span>
            </div>
            <div class="footer-item">
              <span class="key-badge">
                <EnterOutlined />
              </span>
              <span class="footer-text">{{ $t('common.select') }}</span>
            </div>
            <div v-if="!hasSearchQuery" class="footer-item">
              <span class="key-badge">
                <ArrowLeftOutlined />
              </span>
              <span class="key-badge">
                <ArrowRightOutlined />
              </span>
              <span class="footer-text">{{ $t('layout.switchMenuCollection') }}</span>
            </div>
            <div class="footer-item">
              <span class="key-badge">ESC</span>
              <span class="footer-text">{{ $t('common.close') }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { MenuHistoryItem, MenuSearchView } from '@/types/navigation';
import type { MenuItem } from '@/types/router';

import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  EnterOutlined,
  FileOutlined,
  SearchOutlined,
  StarFilled,
  StarOutlined,
} from '@antdv-next/icons';
import { match as pinyinMatch } from 'pinyin-pro';
import { computed, h, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { basicRoutes } from '@/router/routes';
import { routesToMenuTree } from '@/router/utils';
import { useMenuPreferencesStore } from '@/stores/menuPreferences';
import { usePermissionStore } from '@/stores/permission';
import { resolveLocaleText } from '@/utils/i18n';
import { resolveIcon } from '@/utils/icon';
import {
  normalizeMenuHistoryItems,
  resolveMenuSearchViewShortcut,
  selectMenuItemsByPaths,
} from '@/utils/menuPreferences';
import { searchMenuItems } from '@/utils/menuSearch';

const MENU_HISTORY_KEY = 'app-menu-history';

interface SearchItem {
  path: string;
  title: string;
  icon?: string;
  leafTitle: string;
}

const router = useRouter();
const { locale, t } = useI18n();
const permissionStore = usePermissionStore();
const menuPreferencesStore = useMenuPreferencesStore();
const visible = defineModel<boolean>('open', { default: false });
const searchQuery = ref('');
const searchResults = ref<SearchItem[]>([]);
const activeIndex = ref(0);
const searchInputRef = ref<HTMLInputElement | null>(null);
const searchBodyRef = ref<HTMLElement | null>(null);
const searchContentRef = ref<HTMLElement | null>(null);
const menuHistory = ref<MenuHistoryItem[]>([]);
const normalizedSearchQuery = computed(() => searchQuery.value.trim());
const hasSearchQuery = computed(() => normalizedSearchQuery.value.length > 0);
const activeView = computed(() => menuPreferencesStore.searchView);

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let previouslyFocusedElement: HTMLElement | null = null;
let previousBodyOverflow = '';

const fallbackMenus = computed<MenuItem[]>(() => {
  const basicChildren = basicRoutes.flatMap((route) => route.children || []);
  return routesToMenuTree(basicChildren);
});

const menuSource = computed<MenuItem[]>(() => {
  if (permissionStore.menuTree.length > 0) {
    return permissionStore.menuTree;
  }
  return fallbackMenus.value;
});

const searchSource = computed<SearchItem[]>(() => {
  // Establish a dependency so persisted recent/favorite rows follow locale changes.
  const currentLocale = locale.value;
  void currentLocale;

  const items: SearchItem[] = [];

  const traverse = (menus: MenuItem[], parentLabels: string[] = []) => {
    menus.forEach((menu) => {
      const currentLabel = resolveLocaleText(menu.label, menu.path);
      const currentLabels = [...parentLabels, currentLabel];

      if (menu.children && menu.children.length > 0) {
        traverse(menu.children, currentLabels);
      } else if (menu.path) {
        items.push({
          path: menu.path,
          title: currentLabels.join(' > '),
          icon: menu.icon,
          leafTitle: currentLabel,
        });
      }
    });
  };

  traverse(menuSource.value);

  const uniqueByPath = new Map<string, SearchItem>();
  items.forEach((item) => {
    if (!uniqueByPath.has(item.path)) {
      uniqueByPath.set(item.path, item);
    }
  });
  return Array.from(uniqueByPath.values());
});

const recentItems = computed(() =>
  selectMenuItemsByPaths(
    searchSource.value,
    menuHistory.value.map((item) => item.path),
  ),
);

const favoriteItems = computed(() =>
  selectMenuItemsByPaths(searchSource.value, menuPreferencesStore.favoritePaths),
);

const activeCollectionItems = computed(() =>
  activeView.value === 'favorites' ? favoriteItems.value : recentItems.value,
);

const activeVisibleItems = computed(() =>
  hasSearchQuery.value ? searchResults.value : activeCollectionItems.value,
);

const activeItemLabel = computed(() => activeVisibleItems.value[activeIndex.value]?.title ?? '');

const createCollectionLabel = (label: string, count: number) =>
  h('span', { class: 'collection-option' }, [
    h('span', { class: 'collection-name' }, label),
    h('span', { class: 'collection-count' }, String(count)),
  ]);

const collectionOptions = computed(() => [
  {
    value: 'recent',
    label: createCollectionLabel(t('layout.recentMenus'), recentItems.value.length),
    icon: h(ClockCircleOutlined),
  },
  {
    value: 'favorites',
    label: createCollectionLabel(t('layout.favoriteMenus'), favoriteItems.value.length),
    icon: h(StarOutlined),
  },
]);

const getIconComponent = (icon?: string) => resolveIcon(icon);

const isExternalPath = (path: string): boolean => /^https?:\/\//i.test(path);

const formatPath = (path: string): string => {
  if (isExternalPath(path)) {
    return path.replace(/^https?:\/\//i, '');
  }
  return path.split('/').filter(Boolean).join(' > ');
};

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const highlightText = (text: string, query: string): string => {
  if (!query) return escapeHtml(text);

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  if (regex.test(text)) {
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  const matched = pinyinMatch(text, query);
  if (matched && matched.length > 0) {
    const indexSet = new Set(matched);
    return Array.from(text)
      .map((char, index) =>
        indexSet.has(index) ? `<span class="highlight">${char}</span>` : escapeHtml(char),
      )
      .join('');
  }

  return escapeHtml(text);
};

const resetSearchScroll = (): void => {
  nextTick(() => {
    if (searchBodyRef.value) {
      searchBodyRef.value.scrollTop = 0;
    }
  });
};

const runSearch = (): SearchItem[] => {
  if (!hasSearchQuery.value) return [];
  return searchMenuItems(searchSource.value, normalizedSearchQuery.value);
};

const handleSearch = (): void => {
  searchResults.value = runSearch();
  activeIndex.value = 0;
  resetSearchScroll();
};

const handleItemClick = (item: Pick<SearchItem, 'path'>): void => {
  if (isExternalPath(item.path)) {
    window.open(item.path, '_blank', 'noopener,noreferrer');
  } else {
    void router.push(item.path);
  }
  close();
};

const handleResultClick = (result: SearchItem): void => {
  handleItemClick(result);
};

const isFavorite = (path: string): boolean => menuPreferencesStore.isFavorite(path);

const favoriteActionLabel = (path: string): string => {
  const item = searchSource.value.find((candidate) => candidate.path === path);
  const name = item?.leafTitle || path;
  return t(isFavorite(path) ? 'layout.removeMenuFavorite' : 'layout.addMenuFavorite', { name });
};

const clampActiveIndex = (): void => {
  const items = hasSearchQuery.value ? searchResults.value : activeCollectionItems.value;
  activeIndex.value = items.length === 0 ? 0 : Math.min(activeIndex.value, items.length - 1);
};

const toggleFavorite = (path: string): void => {
  const removesVisibleFavorite =
    !hasSearchQuery.value && activeView.value === 'favorites' && isFavorite(path);
  menuPreferencesStore.toggleFavorite(path);
  nextTick(() => {
    clampActiveIndex();
    if (removesVisibleFavorite) {
      searchInputRef.value?.focus();
    }
  });
};

const setActiveView = (view: MenuSearchView): void => {
  menuPreferencesStore.setSearchView(view);
  activeIndex.value = 0;
  resetSearchScroll();
};

const handleCollectionChange = (value: string | number): void => {
  if (value === 'recent' || value === 'favorites') {
    setActiveView(value);
  }
};

const scrollActiveIntoView = (): void => {
  nextTick(() => {
    const activeElement = searchBodyRef.value?.querySelector('.search-item.active');
    activeElement?.scrollIntoView({ block: 'nearest' });
  });
};

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    event.preventDefault();
    close();
    return;
  }

  const shortcutView = resolveMenuSearchViewShortcut(
    activeView.value,
    event.key,
    hasSearchQuery.value,
  );
  if (shortcutView) {
    event.preventDefault();
    setActiveView(shortcutView);
    return;
  }

  const isNavigationKey = ['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key);
  if (!isNavigationKey) return;

  const items = hasSearchQuery.value ? runSearch() : activeCollectionItems.value;
  if (hasSearchQuery.value) {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = null;
    }
    searchResults.value = items;
  }
  if (items.length === 0) return;

  activeIndex.value = Math.min(activeIndex.value, items.length - 1);

  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault();
      activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : items.length - 1;
      scrollActiveIntoView();
      break;
    case 'ArrowDown':
      event.preventDefault();
      activeIndex.value = activeIndex.value < items.length - 1 ? activeIndex.value + 1 : 0;
      scrollActiveIntoView();
      break;
    case 'Enter': {
      event.preventDefault();
      const item = items[activeIndex.value];
      if (item) handleItemClick(item);
      break;
    }
  }
};

const loadMenuHistory = (): void => {
  try {
    const saved = window.localStorage.getItem(MENU_HISTORY_KEY);
    if (!saved) {
      menuHistory.value = [];
      return;
    }

    const parsed: unknown = JSON.parse(saved);
    const normalizedHistory = normalizeMenuHistoryItems(parsed);
    menuHistory.value = normalizedHistory;
    if (!Array.isArray(parsed) || normalizedHistory.length !== parsed.length) {
      window.localStorage.setItem(MENU_HISTORY_KEY, JSON.stringify(normalizedHistory));
    }
  } catch {
    menuHistory.value = [];
    try {
      window.localStorage.removeItem(MENU_HISTORY_KEY);
    } catch {
      // Ignore storage failures after restoring an empty in-memory history.
    }
  }
};

const clearHistory = (): void => {
  menuHistory.value = [];
  activeIndex.value = 0;
  try {
    window.localStorage.removeItem(MENU_HISTORY_KEY);
  } catch {
    // The visible history is still cleared when storage is unavailable.
  }
  nextTick(() => searchInputRef.value?.focus());
};

const close = (): void => {
  visible.value = false;
};

const getFocusableElements = (): HTMLElement[] => {
  const container = searchContentRef.value;
  if (!container) return [];

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]):not(.ant-segmented-item-input), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (element) =>
      element.getAttribute('aria-hidden') !== 'true' && element.getClientRects().length > 0,
  );
};

const handleGlobalKeydown = (event: KeyboardEvent): void => {
  if (event.defaultPrevented) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    close();
    return;
  }

  if (event.key !== 'Tab') return;

  const focusableElements = getFocusableElements();
  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  if (!searchContentRef.value?.contains(document.activeElement)) {
    event.preventDefault();
    (event.shiftKey ? lastElement : firstElement).focus();
  } else if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
};

watch(searchQuery, () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  if (!hasSearchQuery.value) {
    handleSearch();
    searchDebounceTimer = null;
    return;
  }

  searchDebounceTimer = setTimeout(() => {
    handleSearch();
    searchDebounceTimer = null;
  }, 150);
});

watch(
  visible,
  (isVisible, wasVisible) => {
    window.removeEventListener('keydown', handleGlobalKeydown);

    if (!isVisible) {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = null;
      }
      document.body.style.overflow = previousBodyOverflow;
      if (wasVisible) {
        nextTick(() => previouslyFocusedElement?.focus());
      }
      return;
    }

    previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    searchQuery.value = '';
    searchResults.value = [];
    activeIndex.value = 0;
    loadMenuHistory();
    window.addEventListener('keydown', handleGlobalKeydown);
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
  document.body.style.overflow = previousBodyOverflow;
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
});
</script>

<style scoped lang="scss">
.global-search-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: min(14vh, 120px);
  background-color: var(--color-bg-mask);
  backdrop-filter: blur(4px);
}

.global-search-content {
  width: calc(100% - 32px);
  max-width: 600px;
  max-height: calc(100dvh - 48px);
  background-color: var(--color-bg-container);
  border-radius: 12px;
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.12),
    0 8px 16px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border-secondary);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 16px 16px 16px 20px;
  border-bottom: 1px solid var(--color-border-secondary);
  transition: box-shadow 0.16s ease;

  &:focus-within {
    box-shadow: inset 0 -2px 0 var(--color-text-primary);
  }

  .search-icon {
    font-size: 20px;
    color: var(--color-text-tertiary);
    margin-right: 12px;
  }

  .search-input {
    flex: 1;
    font-size: 18px;
    border: none;
    outline: none;
    background: transparent;
    color: var(--color-text-primary);
    line-height: 1.5;

    &::placeholder {
      color: var(--color-text-quaternary);
    }
  }

  .search-tag {
    padding: 2px 6px;
    border-radius: 4px;
    background-color: var(--color-bg-layout);
    border: 1px solid var(--color-border-secondary);
    color: var(--color-text-tertiary);
    font-size: 12px;
    font-family: var(--font-family-code);
    line-height: 1.4;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
  }
}

.search-body {
  padding: 12px 0;
  max-height: min(420px, calc(100dvh - 196px));
  overflow-y: auto;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.search-collection-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  padding: 0 16px 12px;
  border-bottom: 1px solid var(--color-border-secondary);

  :deep(.ant-segmented) {
    background-color: var(--color-bg-layout);
  }

  :deep(.collection-option) {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  :deep(.collection-count) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background-color: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
    color: var(--color-text-tertiary);
    font-size: 11px;
    line-height: 18px;
  }

  :deep(.ant-segmented-item-selected .collection-count) {
    background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
    color: var(--color-text-primary);
  }

  .clear-btn {
    flex-shrink: 0;
    height: 24px;
    padding: 0 4px;
    font-size: 12px;
  }
}

.search-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 0 8px;
  border-radius: 8px;
  transition:
    background-color 0.12s ease,
    box-shadow 0.12s ease;
  position: relative;

  &:not(.active):hover {
    background-color: var(--color-bg-layout);
  }

  &.active {
    background-color: color-mix(in srgb, var(--color-primary) 12%, var(--color-bg-container));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 24%, transparent);
    color: var(--color-text-primary);

    .item-icon {
      color: var(--color-primary);
    }

    .item-path {
      color: var(--color-text-secondary);
    }

    .item-enter {
      opacity: 1;
      color: var(--color-primary);
    }
  }

  .item-main {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    padding: 0;
    color: inherit;
    font: inherit;
    text-align: left;
    background: transparent;
    border: 0;
    border-radius: 6px;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--color-text-primary);
      outline-offset: 2px;
    }
  }

  .item-icon {
    font-size: 18px;
    color: var(--color-text-secondary);
    margin-right: 12px;
    display: flex;
    align-items: center;
  }

  .item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .item-title {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;

    :deep(.highlight) {
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }

  .item-path {
    font-size: 12px;
    color: var(--color-text-tertiary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    :deep(.highlight) {
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }

  .item-enter {
    font-size: 14px;
    color: var(--color-text-tertiary);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .item-actions {
    display: flex;
    align-items: center;
    margin-right: 8px;

    .favorite-btn {
      width: 24px;
      height: 24px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      .favorite-icon {
        font-size: 14px;
        color: var(--color-text-tertiary);
        transition: color 0.2s;

        &.active {
          color: var(--color-warning);
        }
      }

      &:hover .favorite-icon:not(.active) {
        color: var(--color-warning);
      }
    }
  }
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 164px;
  padding: 36px 24px;
  color: var(--color-text-tertiary);
  text-align: center;

  .empty-icon {
    font-size: 36px;
    margin-bottom: 10px;
    opacity: 0.45;
  }

  .empty-title {
    color: var(--color-text-secondary);
    font-size: 14px;
    font-weight: 500;
  }

  p {
    max-width: 360px;
    margin: 5px 0 0;
    font-size: 12px;
    line-height: 1.6;
  }
}

.search-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 16px;
  border-top: 1px solid var(--color-border-secondary);
  background-color: var(--color-bg-layout);
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);

  .key-badge {
    padding: 2px 4px;
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-bg-container);
    border: 1px solid var(--color-border-secondary);
    border-radius: 3px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    font-family: var(--font-family-code);
    font-size: 11px;
  }
}

// Transitions
.search-modal-enter-active,
.search-modal-leave-active {
  transition: opacity 0.2s ease;

  .global-search-content {
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
}

.search-modal-enter-from,
.search-modal-leave-to {
  opacity: 0;

  .global-search-content {
    transform: scale(0.95) translateY(10px);
  }
}

@media (max-width: 640px) {
  .global-search-overlay {
    padding-top: 24px;
  }

  .global-search-content {
    max-height: calc(100dvh - 48px);
  }

  .search-input-wrapper {
    padding: 14px 14px 14px 16px;
  }

  .search-collection-toolbar {
    align-items: stretch;

    :deep(.ant-segmented) {
      flex: 1;
    }
  }

  .search-footer {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .search-modal-enter-active,
  .search-modal-leave-active,
  .search-modal-enter-active .global-search-content,
  .search-modal-leave-active .global-search-content,
  .search-item,
  .item-enter {
    transition: none !important;
  }
}
</style>
