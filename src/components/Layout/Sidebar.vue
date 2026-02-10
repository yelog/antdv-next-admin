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
      :items="antMenuItems"
      class="sidebar-menu"
      @click="handleMenuClick"
    />
  </a-layout-sider>
</template>

<script setup lang="ts">
import { ref, computed, watch, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { MenuProps } from 'antdv-next'
import { useLayoutStore } from '@/stores/layout'
import { useSettingsStore } from '@/stores/settings'
import { usePermissionStore } from '@/stores/permission'
import { basicRoutes } from '@/router/routes'
import { routesToMenuTree } from '@/router/utils'
import type { MenuItem as MenuItemType } from '@/types/router'
import { resolveLocaleText } from '@/utils/i18n'
import { resolveIcon } from '@/utils/icon'

const route = useRoute()
const router = useRouter()
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

const antMenuItems = computed<MenuProps['items']>(() => {
  const convert = (menus: MenuItemType[]): NonNullable<MenuProps['items']> => {
    return menus.map(menu => {
      const iconComponent = resolveIcon(menu.icon)
      const item = {
        key: menu.path || menu.id,
        label: resolveLocaleText(menu.label, menu.id),
        icon: iconComponent ? h(iconComponent) : undefined
      }

      if (menu.children && menu.children.length > 0) {
        return {
          ...item,
          key: menu.id,
          children: convert(menu.children)
        }
      }

      return item
    })
  }

  return convert(menuItems.value)
})

function findMenuOpenKeys(
  menus: MenuItemType[],
  targetPath: string,
  parents: string[] = []
): string[] {
  for (const item of menus) {
    const menuKey = item.children && item.children.length > 0
      ? item.id
      : (item.path || item.id)
    const currentParents = [...parents, menuKey]

    if ((item.path || item.id) === targetPath) {
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

const handleMenuClick = ({ key }: { key: string | number }) => {
  if (typeof key === 'string' && key.startsWith('/')) {
    router.push(key)
  }
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
    margin-top: 8px;
    padding: 0 12px;

    :deep(.ant-menu-item),
    :deep(.ant-menu-submenu-title) {
      margin: 4px 0;
      border-radius: 8px;
      height: 40px;
      line-height: 40px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
