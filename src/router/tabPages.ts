import type { AppRouteRecordRaw } from '@/types/router';
import type { Component } from 'vue';

type TabPageRoute = Omit<AppRouteRecordRaw, 'component' | 'children'> & {
  component?: () => Promise<{ default: Component }>;
  children?: TabPageRoute[];
};

export function nameTabPages(routes: TabPageRoute[]): AppRouteRecordRaw[] {
  return routes.map((route) => {
    if (route.children) {
      return { ...route, children: nameTabPages(route.children) };
    }

    const { name, component } = route;
    if (!name || !component || route.meta?.hidden || route.meta?.keepAlive === false) {
      return route;
    }

    return {
      ...route,
      component: async () => {
        const { default: page } = await component();
        return { ...page, name: String(name) };
      },
    };
  });
}
