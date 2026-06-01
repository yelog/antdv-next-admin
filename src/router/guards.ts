import type { Router, RouteLocationNormalized, RouteRecordRaw } from "vue-router";

import type { AppRouteRecordRaw } from "@/types/router";

import { useAuthStore } from "@/stores/auth";
import { useDictStore } from "@/stores/dict";
import { usePermissionStore } from "@/stores/permission";
import { useTabsStore } from "@/stores/tabs";
import { resolveLocaleText } from "@/utils/i18n";

import { basicRoutes, notFoundRoute } from "./routes";

const MENU_HISTORY_KEY = "app-menu-history";
const MAX_HISTORY_ITEMS = 10;

interface MenuHistoryItem {
  path: string;
  title: string;
  icon?: string;
  timestamp: number;
}

function setDocumentTitle(route: RouteLocationNormalized) {
  if (!route.meta.title) return;

  const title = resolveLocaleText(
    route.meta.title as string,
    String(route.name || route.path || "Dashboard"),
  );
  document.title = `${title} - ${import.meta.env.VITE_APP_TITLE || "Antdv Next Admin"}`;
}

async function ensureDynamicRoutes(
  router: Router,
  authStore: ReturnType<typeof useAuthStore>,
  permissionStore: ReturnType<typeof usePermissionStore>,
  dictStore: ReturnType<typeof useDictStore>,
) {
  if (permissionStore.isRoutesGenerated) return;

  if (!authStore.user) {
    authStore.initAuth();
  }

  const accessRoutes = await permissionStore.generateRoutes(
    authStore.userRoles,
    authStore.userPermissions,
  );

  accessRoutes.forEach((route) => {
    const routeName = route.name ? String(route.name) : "";
    if (routeName && router.hasRoute(routeName)) {
      return;
    }
    router.addRoute(route);
  });

  if (!router.hasRoute("NotFound")) {
    router.addRoute(notFoundRoute as unknown as RouteRecordRaw);
  }

  dictStore.loadDictData();
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

function getRedirectedFromPath(route: RouteLocationNormalized) {
  return route.redirectedFrom?.fullPath;
}

function shouldRecoverFromNotFound(
  route: RouteLocationNormalized,
  authStore: ReturnType<typeof useAuthStore>,
  permissionStore: ReturnType<typeof usePermissionStore>,
) {
  const redirectedFromPath = getRedirectedFromPath(route);
  return (
    route.path === "/404" &&
    !!redirectedFromPath &&
    redirectedFromPath !== "/404" &&
    !!authStore.token &&
    !permissionStore.isRoutesGenerated
  );
}

function shouldRedirectNotFoundToLogin(
  route: RouteLocationNormalized,
  authStore: ReturnType<typeof useAuthStore>,
) {
  const redirectedFromPath = getRedirectedFromPath(route);
  return (
    route.path === "/404" &&
    !!redirectedFromPath &&
    redirectedFromPath !== "/404" &&
    !authStore.token
  );
}

function getRouteAccessRedirect(
  route: RouteLocationNormalized,
  authStore: ReturnType<typeof useAuthStore>,
) {
  const requiredPermissions = route.meta.requiredPermissions as
    | string[]
    | undefined;
  if (Array.isArray(requiredPermissions) && requiredPermissions.length > 0) {
    const hasPermission = authStore.hasAnyPermission(requiredPermissions);
    if (!hasPermission) {
      return "/403";
    }
  }

  const requiredRoles = route.meta.requiredRoles as string[] | undefined;
  if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
    const hasRole = authStore.hasAnyRole(requiredRoles);
    if (!hasRole) {
      return "/403";
    }
  }

  return undefined;
}

function shouldAddTab(route: RouteLocationNormalized) {
  return Boolean(route.name && route.meta.requiresAuth !== false && !route.meta.hidden);
}

function recordMenuHistory(route: RouteLocationNormalized) {
  try {
    const history: MenuHistoryItem[] = JSON.parse(
      localStorage.getItem(MENU_HISTORY_KEY) || "[]",
    );
    const title = resolveLocaleText(
      route.meta?.title as string,
      String(route.name || route.path),
    );

    const filtered = history.filter((item) => item.path !== route.path);

    filtered.unshift({
      path: route.path,
      title,
      icon: route.meta?.icon as string,
      timestamp: Date.now(),
    });

    const trimmed = filtered.slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(MENU_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {}
}

/**
 * Setup router guards
 */
export function setupRouterGuards(router: Router) {
  // Before each route navigation
  router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore();
    const permissionStore = usePermissionStore();
    const tabsStore = useTabsStore();
    const dictStore = useDictStore();

    // Set page title
    setDocumentTitle(to);

    // If first refresh hits catch-all and is redirected to 404,
    // restore dynamic routes first, then retry the original target.
    const redirectedFromPath = to.redirectedFrom?.fullPath;

    if (shouldRecoverFromNotFound(to, authStore, permissionStore)) {
      try {
        await ensureDynamicRoutes(router, authStore, permissionStore, dictStore);
        initTabsIfNeeded(tabsStore, permissionStore);
        next({ path: redirectedFromPath, replace: true });
        return;
      } catch (error) {
        console.error(
          "Failed to recover routes from not found redirect:",
          error,
        );
        next("/403");
        return;
      }
    }

    // If catch-all redirected to 404 but user is not logged in,
    // redirect to login instead of showing 404
    if (shouldRedirectNotFoundToLogin(to, authStore)) {
      next({ path: "/login", query: { redirect: redirectedFromPath } });
      return;
    }

    // Check if route requires authentication
    const requiresAuth = to.meta.requiresAuth !== false;

    if (requiresAuth) {
      // Check if user is logged in
      if (!authStore.token) {
        // Redirect to login page
        next({
          path: "/login",
          query: { redirect: to.fullPath },
        });
        return;
      }

      // Generate dynamic routes if not already generated
      if (!permissionStore.isRoutesGenerated) {
        try {
          await ensureDynamicRoutes(router, authStore, permissionStore, dictStore);
          initTabsIfNeeded(tabsStore, permissionStore);

          // Continue to the target route
          next({ ...to, replace: true });
          return;
        } catch (error) {
          console.error("Failed to generate routes:", error);
          next("/403");
          return;
        }
      }

      const accessRedirect = getRouteAccessRedirect(to, authStore);
      if (accessRedirect) {
        next(accessRedirect);
        return;
      }

      initTabsIfNeeded(tabsStore, permissionStore);
    }

    // Add to tabs
    if (shouldAddTab(to)) {
      tabsStore.addTab(to);
    }

    next();
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
    console.error("Router error:", error);
  });
}
