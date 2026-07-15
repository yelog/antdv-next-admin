import type { MenuHistoryItem, MenuSearchView } from '@/types/navigation';

interface LegacyFavoriteTab {
  path?: unknown;
  favorite?: unknown;
}

interface LegacyTabsState {
  tabs?: unknown;
}

const DEFAULT_MENU_SEARCH_VIEW: MenuSearchView = 'recent';
const MENU_SEARCH_VIEWS: readonly MenuSearchView[] = ['recent', 'favorites'];

function parseJson(raw: string | null): unknown {
  if (raw === null) return undefined;

  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function normalizeFavoritePaths(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const paths: string[] = [];
  const seen = new Set<string>();

  value.forEach((entry) => {
    if (typeof entry !== 'string') return;

    const path = entry.trim();
    if (!path || seen.has(path)) return;

    seen.add(path);
    paths.push(path);
  });

  return paths;
}

function extractLegacyFavoritePaths(value: unknown): string[] {
  if (!value || typeof value !== 'object') return [];

  const tabs = (value as LegacyTabsState).tabs;
  if (!Array.isArray(tabs)) return [];

  return (
    normalizeFavoritePaths(
      tabs
        .filter(
          (tab): tab is LegacyFavoriteTab =>
            Boolean(tab) && typeof tab === 'object' && tab.favorite === true,
        )
        .map((tab) => tab.path),
    ) ?? []
  );
}

export function resolveStoredFavoritePaths(
  rawFavorites: string | null,
  rawLegacyTabsState: string | null,
): string[] {
  const currentPaths = normalizeFavoritePaths(parseJson(rawFavorites));
  if (currentPaths) return currentPaths;

  return extractLegacyFavoritePaths(parseJson(rawLegacyTabsState));
}

export function resolveStoredMenuSearchView(rawView: string | null): MenuSearchView {
  return rawView === 'favorites' || rawView === 'recent' ? rawView : DEFAULT_MENU_SEARCH_VIEW;
}

export function resolveMenuSearchViewShortcut(
  currentView: MenuSearchView,
  key: string,
  hasSearchQuery: boolean,
): MenuSearchView | null {
  if (hasSearchQuery || (key !== 'ArrowLeft' && key !== 'ArrowRight')) return null;

  const direction = key === 'ArrowLeft' ? -1 : 1;
  const currentIndex = MENU_SEARCH_VIEWS.indexOf(currentView);
  const nextIndex =
    (currentIndex + direction + MENU_SEARCH_VIEWS.length) % MENU_SEARCH_VIEWS.length;
  return MENU_SEARCH_VIEWS[nextIndex];
}

export function normalizeMenuHistoryItems(value: unknown): MenuHistoryItem[] {
  if (!Array.isArray(value)) return [];

  return value.filter((entry): entry is MenuHistoryItem => {
    if (!entry || typeof entry !== 'object') return false;

    const item = entry as Partial<MenuHistoryItem>;
    return (
      typeof item.path === 'string' &&
      item.path.trim().length > 0 &&
      typeof item.title === 'string' &&
      typeof item.timestamp === 'number' &&
      Number.isFinite(item.timestamp) &&
      (item.icon === undefined || typeof item.icon === 'string')
    );
  });
}

export function selectMenuItemsByPaths<T extends { path: string }>(
  currentItems: readonly T[],
  paths: readonly string[],
): T[] {
  const currentByPath = new Map(currentItems.map((item) => [item.path, item]));
  const selectedItems: T[] = [];
  const selectedPaths = new Set<string>();

  paths.forEach((path) => {
    if (selectedPaths.has(path)) return;

    const item = currentByPath.get(path);
    if (!item) return;

    selectedPaths.add(path);
    selectedItems.push(item);
  });

  return selectedItems;
}
