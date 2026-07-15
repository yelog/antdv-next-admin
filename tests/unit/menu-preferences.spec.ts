import { describe, expect, it } from 'vitest';

import {
  normalizeMenuHistoryItems,
  resolveMenuSearchViewShortcut,
  resolveStoredFavoritePaths,
  resolveStoredMenuSearchView,
  selectMenuItemsByPaths,
} from '@/utils/menuPreferences';

describe('menu preferences', () => {
  it('normalizes stored favorite paths and keeps the first occurrence', () => {
    const rawFavorites = JSON.stringify([
      '/system/users',
      '',
      42,
      '/system/users',
      'https://vuejs.org',
      '  ',
    ]);

    expect(resolveStoredFavoritePaths(rawFavorites, null)).toEqual([
      '/system/users',
      'https://vuejs.org',
    ]);
  });

  it('treats a valid empty current favorite list as an explicit choice', () => {
    const legacyState = JSON.stringify({
      tabs: [{ path: '/dashboard', favorite: true }],
    });

    expect(resolveStoredFavoritePaths('[]', legacyState)).toEqual([]);
  });

  it('migrates legacy favorite tabs when the current value is absent or invalid', () => {
    const legacyState = JSON.stringify({
      tabs: [
        { path: '/dashboard', favorite: true },
        { path: '/system/users', favorite: false },
        { path: '/examples/form', favorite: true },
        { path: '/dashboard', favorite: true },
      ],
    });

    expect(resolveStoredFavoritePaths(null, legacyState)).toEqual(['/dashboard', '/examples/form']);
    expect(resolveStoredFavoritePaths('{invalid', legacyState)).toEqual([
      '/dashboard',
      '/examples/form',
    ]);
  });

  it('falls back safely when persisted favorite data is malformed', () => {
    expect(resolveStoredFavoritePaths('{invalid', '{also-invalid')).toEqual([]);
    expect(resolveStoredFavoritePaths('{}', JSON.stringify({ tabs: 'invalid' }))).toEqual([]);
  });

  it('accepts only supported menu search views', () => {
    expect(resolveStoredMenuSearchView('favorites')).toBe('favorites');
    expect(resolveStoredMenuSearchView('recent')).toBe('recent');
    expect(resolveStoredMenuSearchView('unknown')).toBe('recent');
    expect(resolveStoredMenuSearchView(null)).toBe('recent');
  });

  it('uses horizontal arrows for empty-query collection switching only', () => {
    expect(resolveMenuSearchViewShortcut('recent', 'ArrowRight', false)).toBe('favorites');
    expect(resolveMenuSearchViewShortcut('favorites', 'ArrowRight', false)).toBe('recent');
    expect(resolveMenuSearchViewShortcut('recent', 'ArrowLeft', false)).toBe('favorites');
    expect(resolveMenuSearchViewShortcut('favorites', 'ArrowLeft', false)).toBe('recent');
    expect(resolveMenuSearchViewShortcut('recent', 'Tab', false)).toBeNull();
    expect(resolveMenuSearchViewShortcut('recent', 'ArrowRight', true)).toBeNull();
  });

  it('selects current accessible menu records in persisted path order', () => {
    const currentMenus = [
      { path: '/dashboard', title: '工作台', icon: 'DashboardOutlined' },
      { path: '/system/users', title: '系统管理 > 用户管理', icon: 'UserOutlined' },
    ];

    expect(
      selectMenuItemsByPaths(currentMenus, [
        '/system/users',
        '/removed',
        '/dashboard',
        '/system/users',
      ]),
    ).toEqual([currentMenus[1], currentMenus[0]]);
  });

  it('removes malformed menu history records before the next write', () => {
    const validItem = {
      path: '/dashboard',
      title: '工作台',
      icon: 'DashboardOutlined',
      timestamp: 1_720_000_000_000,
    };

    expect(
      normalizeMenuHistoryItems([
        null,
        validItem,
        { path: '/system/users', title: '用户管理', timestamp: 'invalid' },
        { path: '', title: '空路径', timestamp: 1_720_000_000_001 },
      ]),
    ).toEqual([validItem]);
    expect(normalizeMenuHistoryItems({ path: '/dashboard' })).toEqual([]);
  });
});
