import type { MenuHistoryItem } from '@/types/navigation';
import type { AppRouteRecordRaw } from '@/types/router';
import type { Router, RouteLocationNormalized, RouteRecordRaw } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import { useDictStore } from '@/stores/dict';
import { usePermissionStore } from '@/stores/permission';
import { useTabsStore } from '@/stores/tabs';
import { resolveLocaleText } from '@/utils/i18n';
import { normalizeMenuHistoryItems } from '@/utils/menuPreferences';

import { shouldRecoverDynamicRoute } from './routeRecovery';
import { basicRoutes, notFoundRoute, staticRoutes } from './routes';
import { getRouteNamesToRemove } from './utils';

const MENU_HISTORY_KEY = 'app-menu-history';
const MAX_HISTORY_ITEMS = 10;

function setDocumentTitle(route: RouteLocationNormalized) {
  if (!route.meta.title) return;

  const title = resolveLocaleText(
    route.meta.title as string,
    String(route.name || route.path || 'Dashboard'),
  );
  document.title = `${title} - ${import.meta.env.VITE_APP_TITLE || 'Antdv Next Admin'}`;
}

async function ensureDynamicRoutes(
  router: Router,
  authStore: ReturnType<typeof useAuthStore>,
  permissionStore: ReturnType<typeof usePermissionStore>,
  dictStore: ReturnType<typeof useDictStore>,
  options: { replaceExisting?: boolean } = {},
) {
  if (permissionStore.isRoutesGenerated && !options.replaceExisting) return;

  if (!authStore.user) {
    authStore.initAuth();
  }

  const accessRoutes = await permissionStore.generateRoutes(
    authStore.userRoles,
    authStore.userPermissions,
  );

  if (options.replaceExisting) {
    const routesToKeep = [
      ...staticRoutes,
      ...basicRoutes,
      notFoundRoute,
      ...(accessRoutes as unknown as AppRouteRecordRaw[]),
    ];
    getRouteNamesToRemove(
      router.getRoutes().map((route) => route.name),
      routesToKeep,
    ).forEach((name) => {
      router.removeRoute(name);
    });
  }

  accessRoutes.forEach((route) => {
    const routeName = route.name ? String(route.name) : '';
    if (!options.replaceExisting && routeName && router.hasRoute(routeName)) {
      return;
    }
    router.addRoute(route);
  });

  if (!router.hasRoute('NotFoundCatchAll')) {
    router.addRoute(notFoundRoute as unknown as RouteRecordRaw);
  }

  dictStore.loadDictData();
}

export async function rebuildDynamicRoutes(router: Router) {
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();
  const tabsStore = useTabsStore();
  const dictStore = useDictStore();

  permissionStore.resetPermission();
  tabsStore.resetTabs();
  tabsStore.clearTabsState();

  await ensureDynamicRoutes(router, authStore, permissionStore, dictStore, {
    replaceExisting: true,
  });
  initTabsIfNeeded(tabsStore, permissionStore);
}

function initTabsIfNeeded(
  tabsStore: ReturnType<typeof useTabsStore>,
  permissionStore: ReturnType<typeof usePermissionStore>,
) {
  if (tabsStore.tabs.length > 0) return;

  const routeSources = [
    ...basicRoutes,
    ...(permissionStore.routes as unknown as AppRouteRecordRaw[]),
  ];

  tabsStore.restoreTabsState(routeSources);

  if (tabsStore.tabs.length === 0) {
    tabsStore.initAffixTabs(routeSources);
  }
}

function getRouteAccessRedirect(
  route: RouteLocationNormalized,
  authStore: ReturnType<typeof useAuthStore>,
) {
  const requiredPermissions = route.meta.requiredPermissions as string[] | undefined;
  if (Array.isArray(requiredPermissions) && requiredPermissions.length > 0) {
    const hasPermission = authStore.hasAnyPermission(requiredPermissions);
    if (!hasPermission) {
      return '/403';
    }
  }

  const requiredRoles = route.meta.requiredRoles as string[] | undefined;
  if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
    const hasRole = authStore.hasAnyRole(requiredRoles);
    if (!hasRole) {
      return '/403';
    }
  }

  return undefined;
}

function shouldAddTab(route: RouteLocationNormalized) {
  return Boolean(route.name && route.meta.requiresAuth !== false && !route.meta.hidden);
}

function recordMenuHistory(route: RouteLocationNormalized) {
  let history: MenuHistoryItem[] = [];
  try {
    const persistedHistory: unknown = JSON.parse(localStorage.getItem(MENU_HISTORY_KEY) || '[]');
    history = normalizeMenuHistoryItems(persistedHistory);
  } catch {
    // Replace malformed persisted history with the current valid navigation below.
  }

  const title = resolveLocaleText(route.meta?.title as string, String(route.name || route.path));

  const filtered = history.filter((item) => item.path !== route.path);

  filtered.unshift({
    path: route.path,
    title,
    icon: route.meta?.icon as string,
    timestamp: Date.now(),
  });

  const trimmed = filtered.slice(0, MAX_HISTORY_ITEMS);

  try {
    localStorage.setItem(MENU_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // History persistence is optional when storage is unavailable.
  }
}

export function resetRouter(router: Router) {
  const routeNames = router.getRoutes().map((route) => route.name);
  getRouteNamesToRemove(routeNames, [...staticRoutes, ...basicRoutes, notFoundRoute]).forEach(
    (name) => {
      router.removeRoute(name);
    },
  );
}

/**
 * Setup router guards
 */
export function setupRouterGuards(router: Router) {
  // Before each route navigation
  router.beforeEach(async (to) => {
    const authStore = useAuthStore();
    const permissionStore = usePermissionStore();
    const tabsStore = useTabsStore();
    const dictStore = useDictStore();

    // Set page title
    setDocumentTitle(to);

    // A dynamic route may initially match the catch-all on a fresh page load.
    // Restore permission routes first, then resolve the unchanged target again.
    if (
      shouldRecoverDynamicRoute(
        to.name,
        Boolean(authStore.token),
        permissionStore.isRoutesGenerated,
      )
    ) {
      try {
        await ensureDynamicRoutes(router, authStore, permissionStore, dictStore);
        initTabsIfNeeded(tabsStore, permissionStore);
        return { path: to.fullPath, replace: true };
      } catch (error) {
        console.error('Failed to recover dynamic route:', error);
        return '/403';
      }
    }

    // Check if route requires authentication
    const requiresAuth = to.meta.requiresAuth !== false;

    if (requiresAuth) {
      // Check if user is logged in
      if (!authStore.token) {
        // Redirect to login page
        return {
          path: '/login',
          query: { redirect: to.fullPath },
        };
      }

      // Generate dynamic routes if not already generated
      if (!permissionStore.isRoutesGenerated) {
        try {
          await ensureDynamicRoutes(router, authStore, permissionStore, dictStore);
          initTabsIfNeeded(tabsStore, permissionStore);

          // Continue to the target route
          return { ...to, replace: true };
        } catch (error) {
          console.error('Failed to generate routes:', error);
          return '/403';
        }
      }

      const accessRedirect = getRouteAccessRedirect(to, authStore);
      if (accessRedirect) {
        return accessRedirect;
      }

      initTabsIfNeeded(tabsStore, permissionStore);
    }

    // Add to tabs
    if (shouldAddTab(to)) {
      tabsStore.addTab(to);
    }
  });

  // After each route navigation
  router.afterEach((to) => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Set active tab
    const tabsStore = useTabsStore();
    if (to.path) {
      tabsStore.setActiveTab(to.path);
    }

    // Record menu visit history
    if (shouldAddTab(to)) {
      recordMenuHistory(to);
    }
  });

  // On error
  router.onError((error) => {
    console.error('Router error:', error);
  });
}
