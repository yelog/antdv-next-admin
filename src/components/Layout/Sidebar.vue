<template>
  <a-layout-sider
    v-model:collapsed="layoutStore.collapsed"
    :class="['admin-sidebar', settingsStore.sidebarTheme]"
    :width="layoutStore.sidebarWidth"
    :collapsed-width="layoutStore.collapsedWidth"
    :trigger="null"
    collapsible
  >
    <!-- Logo -->
    <div class="sidebar-logo">
      <img src="/logo.svg" alt="Logo" class="logo-img" />
      <transition name="fade">
        <span v-show="!layoutStore.collapsed" class="logo-title">
          {{ $t('common.appName') }}
        </span>
      </transition>
    </div>

    <!-- Menu -->
    <a-menu
      v-model:selectedKeys="selectedKeys"
      v-model:openKeys="openKeys"
      mode="inline"
      :theme="settingsStore.sidebarTheme"
      class="sidebar-menu"
    >
      <MenuItem
        v-for="item in menuItems"
        :key="item.id"
        :item="item"
        :collapsed="layoutStore.collapsed"
      />
    </a-menu>
  </a-layout-sider>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import { useSettingsStore } from '@/stores/settings'
import { usePermissionStore } from '@/stores/permission'
import { basicRoutes } from '@/router/routes'
import { routesToMenuTree } from '@/router/utils'
import type { MenuItem as MenuItemType } from '@/types/router'
import MenuItem from './MenuItem.vue'

const route = useRoute()
const layoutStore = useLayoutStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])

const fallbackMenuItems = computed(() => {
  const basicChildren = basicRoutes.flatMap(route => route.children || [])
  return routesToMenuTree(basicChildren)
})

const menuItems = computed(() => {
  if (permissionStore.menuTree.length > 0) {
    return permissionStore.menuTree
  }
  return fallbackMenuItems.value
})

function findMenuOpenKeys(
  menus: MenuItemType[],
  targetPath: string,
  parents: string[] = []
): string[] {
  for (const item of menus) {
    const currentParents = [...parents, item.id]

    if (item.path === targetPath) {
      return parents
    }

    if (item.children && item.children.length > 0) {
      const matched = findMenuOpenKeys(item.children, targetPath, currentParents)
      if (matched.length > 0) {
        return matched
      }
    }
  }

  return []
}

const syncMenuState = () => {
  selectedKeys.value = [route.path]
  openKeys.value = findMenuOpenKeys(menuItems.value, route.path)
}

watch(
  [() => route.path, menuItems],
  () => {
    syncMenuState()
  },
  { immediate: true, deep: true }
)
</script>

<style scoped lang="scss">
.admin-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  box-shadow: var(--shadow-2);
  z-index: 100;
  transition: all var(--duration-slow) var(--ease-out);

  &.light {
    background: var(--color-bg-container);

    :deep(.ant-menu) {
      background: var(--color-bg-container);
      color: var(--color-text-primary);
    }

    .sidebar-logo {
      border-bottom-color: var(--color-border-secondary);

      .logo-title {
        color: var(--color-text-primary);
      }
    }
  }

  &.dark {
    background: linear-gradient(180deg, #001529 0%, #001d39 100%);

    :deep(.ant-menu) {
      background: transparent;
      color: rgba(255, 255, 255, 0.85);
    }

    .sidebar-logo {
      border-bottom-color: rgba(255, 255, 255, 0.1);

      .logo-title {
        color: rgba(255, 255, 255, 0.92);
      }
    }
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    height: 64px;
    padding: 0 var(--spacing-md);
    border-bottom: 1px solid var(--color-border-secondary);

    .logo-img {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .logo-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      white-space: nowrap;
      overflow: hidden;
    }
  }

  .sidebar-menu {
    border-right: none;
    margin-top: var(--spacing-sm);

    :deep(.ant-menu-item),
    :deep(.ant-menu-submenu-title) {
      margin: 4px 8px;
      border-radius: var(--radius-base);
      transition: all var(--duration-base) var(--ease-out);
    }
  }

  &.dark {
    .sidebar-menu {
      :deep(.ant-menu-item),
      :deep(.ant-menu-submenu-title),
      :deep(.ant-menu-submenu-arrow) {
        color: rgba(255, 255, 255, 0.88) !important;
      }

      :deep(.ant-menu-item:hover),
      :deep(.ant-menu-submenu-title:hover) {
        color: #fff !important;
        background: rgba(255, 255, 255, 0.12) !important;
      }

      :deep(.ant-menu-item-selected) {
        color: #fff !important;
        background: rgba(22, 119, 255, 0.35) !important;
      }
    }
  }

  &.light {
    .sidebar-menu {
      :deep(.ant-menu-item:hover),
      :deep(.ant-menu-submenu-title:hover) {
        background: var(--color-primary-1) !important;
      }

      :deep(.ant-menu-item-selected) {
        color: var(--color-primary) !important;
        background: var(--color-primary-1) !important;
      }
    }
  }
}

// Scrollbar styles
.admin-sidebar::-webkit-scrollbar {
  width: 6px;
}

.admin-sidebar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.admin-sidebar.dark::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}
</style>
