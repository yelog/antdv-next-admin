<template>
  <div
    v-if="showMobileMask"
    class="sidebar-mask"
    @click="closeMobileSidebar"
  />
  <a-layout-sider
    v-model:collapsed="layoutStore.collapsed"
    :class="['admin-sidebar', `theme-${effectiveSidebarTheme}`, { mobile: layoutStore.isMobile }]"
    :width="layoutStore.sidebarWidth"
    :collapsed-width="siderCollapsedWidth"
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
      :theme="effectiveSidebarTheme"
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
import { useThemeStore } from '@/stores/theme'
import { usePermissionStore } from '@/stores/permission'
import { basicRoutes } from '@/router/routes'
import { routesToMenuTree } from '@/router/utils'
import type { MenuItem as MenuItemType } from '@/types/router'
import type { SidebarTheme } from '@/types/layout'
import { resolveLocaleText } from '@/utils/i18n'
import { resolveIcon } from '@/utils/icon'

const route = useRoute()
const router = useRouter()
const layoutStore = useLayoutStore()
const settingsStore = useSettingsStore()
const themeStore = useThemeStore()
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

const effectiveSidebarTheme = computed<SidebarTheme>(() => {
  // In global dark mode, force dark sidebar to keep readable contrast.
  if (themeStore.isDark) {
    return 'dark'
  }
  return settingsStore.sidebarTheme
})

const siderCollapsedWidth = computed(() => {
  return layoutStore.isMobile ? 0 : layoutStore.collapsedWidth
})

const showMobileMask = computed(() => {
  return layoutStore.isMobile && !layoutStore.collapsed
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

function isExternalLinkPath(path: string): boolean {
  return path.startsWith('http://') || path.startsWith('https://')
}

function findMenuByPath(menus: MenuItemType[], targetPath: string): MenuItemType | null {
  for (const item of menus) {
    if ((item.path || item.id) === targetPath) {
      return item
    }

    if (item.children && item.children.length > 0) {
      const found = findMenuByPath(item.children, targetPath)
      if (found) {
        return found
      }
    }
  }

  return null
}

const syncMenuState = () => {
  // Find the menu item for current route
  const currentMenuItem = findMenuByPath(menuItems.value, route.path)
  
  // Don't set selected state if current menu item is an external link
  if (currentMenuItem && currentMenuItem.path && isExternalLinkPath(currentMenuItem.path)) {
    selectedKeys.value = []
  } else {
    selectedKeys.value = [route.path]
  }
  
  openKeys.value = findMenuOpenKeys(menuItems.value, route.path)
}

const closeMobileSidebar = () => {
  if (layoutStore.isMobile && !layoutStore.collapsed) {
    layoutStore.setSidebarCollapsed(true)
  }
}

const handleMenuClick = ({ key }: { key: string | number }) => {
  if (typeof key !== 'string') return

  // External links: open in a new tab
  if (key.startsWith('http://') || key.startsWith('https://')) {
    window.open(key, '_blank', 'noopener,noreferrer')
    closeMobileSidebar()
    return
  }

  // Internal routes
  if (key.startsWith('/')) {
    router.push(key)
    closeMobileSidebar()
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
.sidebar-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.36);
  z-index: 99;
}

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

  &.mobile {
    z-index: 110;
  }

  &.theme-light {
    background: #ffffff;

    :deep(.ant-menu) {
      background: #ffffff;
      color: rgba(0, 0, 0, 0.85);
    }

    .sidebar-logo {
      border-bottom-color: #f0f0f0;

      .logo-title {
        color: rgba(0, 0, 0, 0.88);
      }
    }
  }

  &.theme-dark {
    background: linear-gradient(180deg, #0b1326 0%, #111d38 58%, #132246 100%);

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
    height: 50px;
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

  &.theme-dark {
    .sidebar-menu {
      :deep(.ant-menu-item),
      :deep(.ant-menu-submenu-title),
      :deep(.ant-menu-submenu-arrow) {
        color: rgba(255, 255, 255, 0.88) !important;
      }

      :deep(.ant-menu-item .ant-menu-title-content),
      :deep(.ant-menu-submenu-title .ant-menu-title-content),
      :deep(.ant-menu-item .anticon),
      :deep(.ant-menu-submenu-title .anticon) {
        color: inherit !important;
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

  &.theme-light {
    .sidebar-menu {
      :deep(.ant-menu-item),
      :deep(.ant-menu-submenu-title) {
        color: rgba(0, 0, 0, 0.85) !important;
      }

      :deep(.ant-menu-item .ant-menu-title-content),
      :deep(.ant-menu-submenu-title .ant-menu-title-content),
      :deep(.ant-menu-item .anticon),
      :deep(.ant-menu-submenu-title .anticon),
      :deep(.ant-menu-submenu-arrow) {
        color: inherit !important;
      }

      :deep(.ant-menu-item:hover),
      :deep(.ant-menu-submenu-title:hover) {
        color: rgba(0, 0, 0, 0.88) !important;
        background: #f5f7fa !important;
      }

      :deep(.ant-menu-item-selected) {
        color: #1677ff !important;
        background: #e6f4ff !important;
      }

      :deep(.ant-menu-submenu-selected > .ant-menu-submenu-title) {
        color: #1677ff !important;
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

.admin-sidebar.theme-dark::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}
</style>
