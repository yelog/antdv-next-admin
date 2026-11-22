import type { MenuItem } from '@/types/router';
import type { MenuSearchItem } from '@/utils/menuSearch';

import { computed, type ComputedRef } from 'vue';

import { basicRoutes } from '@/router/routes';
import { routesToMenuTree } from '@/router/utils';
import { usePermissionStore } from '@/stores/permission';
import { resolveLocaleText } from '@/utils/i18n';

export interface MenuDestination extends MenuSearchItem {
  icon?: string;
}

export function useMenuDestinations(): ComputedRef<MenuDestination[]> {
  const store = usePermissionStore();
  return computed(() => {
    const items = new Map<string, MenuDestination>();
    const menus = store.menuTree.length
      ? store.menuTree
      : routesToMenuTree(basicRoutes.flatMap((route) => route.children || []));
    function visit(menu: MenuItem, parent: string[]): void {
      const leafTitle = resolveLocaleText(menu.label, menu.path);
      const trail = [...parent, leafTitle];
      if (menu.children?.length) {
        menu.children.forEach((child) => visit(child, trail));
      } else if (menu.path && !items.has(menu.path)) {
        items.set(menu.path, {
          path: menu.path,
          leafTitle,
          title: trail.join(' > '),
          icon: menu.icon,
        });
      }
    }
    menus.forEach((menu) => visit(menu, []));
    return [...items.values()];
  });
}
