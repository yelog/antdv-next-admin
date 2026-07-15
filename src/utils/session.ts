import type { Router } from 'vue-router';

import { resetRouter } from '@/router';
import { useAuthStore } from '@/stores/auth';
import { usePermissionStore } from '@/stores/permission';
import { useTabsStore } from '@/stores/tabs';

export function clearSessionState(router?: Router) {
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();
  const tabsStore = useTabsStore();

  authStore.logout();
  permissionStore.resetPermission();
  tabsStore.resetTabs();
  tabsStore.clearTabsState();

  if (router) {
    resetRouter(router);
  }
}
