<template>
  <a-layout class="admin-layout" :class="[settingsStore.layoutMode, { mobile: layoutStore.isMobile }]">
    <!-- Vertical Layout -->
    <template v-if="settingsStore.layoutMode === 'vertical'">
      <!-- Sidebar -->
      <Sidebar v-if="!layoutStore.pageFullscreen" />

      <!-- Main Content -->
      <a-layout
        class="layout-main"
        :style="{ marginLeft: layoutStore.isMobile || layoutStore.pageFullscreen ? '0px' : `${layoutStore.getCurrentSidebarWidth()}px` }"
      >
        <!-- Header -->
        <Header v-if="!layoutStore.pageFullscreen" />

        <!-- Tabs -->
        <TabBar />

        <!-- Page Content -->
        <a-layout-content class="page-content">
          <div class="page-scroll">
            <router-view v-slot="{ Component }">
              <transition :name="settingsStore.pageAnimation" mode="out-in">
                <keep-alive :include="cachedTabs">
                  <component :is="Component" :key="$route.fullPath" />
                </keep-alive>
              </transition>
            </router-view>
          </div>
        </a-layout-content>
      </a-layout>
    </template>

    <!-- Horizontal Layout -->
    <template v-else>
      <a-layout-header v-if="!layoutStore.pageFullscreen" class="horizontal-header">
        <div class="header-left">
          <div class="logo">
            <img src="/logo.svg" alt="Logo" />
            <span class="logo-title">{{ $t('common.appName') || 'Antdv Next Admin' }}</span>
          </div>

          <a-menu
            class="horizontal-main-menu"
            mode="horizontal"
            :selected-keys="horizontalSelectedKeys"
            :items="horizontalMenuItems"
            @click="handleHorizontalMenuClick"
          />
        </div>
        <div class="header-right">
          <Header :show-breadcrumb="false" :show-collapse-button="false" />
        </div>
      </a-layout-header>

      <a-layout>
        <a-layout-content class="horizontal-content">
          <!-- Tabs -->
          <TabBar />

          <!-- Page Content -->
          <div class="page-content">
            <div class="page-scroll">
              <router-view v-slot="{ Component }">
                <transition :name="settingsStore.pageAnimation" mode="out-in">
                  <keep-alive :include="cachedTabs">
                    <component :is="Component" :key="$route.fullPath" />
                  </keep-alive>
                </transition>
              </router-view>
            </div>
          </div>
        </a-layout-content>
      </a-layout>
    </template>
  </a-layout>
</template>

<script setup lang="ts">
import { computed, h, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { MenuProps } from 'antdv-next'
import { DownOutlined } from '@antdv-next/icons'
import { useLayoutStore } from '@/stores/layout'
import { useSettingsStore } from '@/stores/settings'
import { useTabsStore } from '@/stores/tabs'
import { usePermissionStore } from '@/stores/permission'
import { basicRoutes } from '@/router/routes'
import { routesToMenuTree } from '@/router/utils'
import type { MenuItem as MenuItemType } from '@/types/router'
import { resolveLocaleText } from '@/utils/i18n'
import { resolveIcon } from '@/utils/icon'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import TabBar from './TabBar.vue'

const route = useRoute()
const router = useRouter()
const layoutStore = useLayoutStore()
const settingsStore = useSettingsStore()
const tabsStore = useTabsStore()
const permissionStore = usePermissionStore()

const cachedTabs = computed(() => tabsStore.cachedTabs)

const fallbackMenuItems = computed(() => {
  const basicChildren = basicRoutes.flatMap(item => item.children || [])
  return routesToMenuTree(basicChildren)
})

const menuItems = computed(() => {
  if (permissionStore.menuTree.length > 0) {
    return permissionStore.menuTree
  }
  return fallbackMenuItems.value
})

const horizontalMenuItems = computed<MenuProps['items']>(() => {
  const convert = (menus: MenuItemType[]): NonNullable<MenuProps['items']> => {
    return menus.map(menu => {
      const iconComponent = resolveIcon(menu.icon)
      const text = resolveLocaleText(menu.label, menu.id)
      const childMenus = menu.children || []
      const hasChildren = childMenus.length > 0
      const item = {
        key: menu.path || menu.id,
        label: hasChildren
          ? h('span', { class: 'horizontal-submenu-label' }, [
            h('span', { class: 'horizontal-submenu-text' }, text),
            h(DownOutlined, { class: 'horizontal-submenu-arrow' })
          ])
          : text,
        icon: iconComponent ? h(iconComponent) : undefined
      }

      if (hasChildren) {
        return {
          ...item,
          key: menu.id,
          children: convert(childMenus)
        }
      }

      return item
    })
  }

  return convert(menuItems.value)
})

const horizontalSelectedKeys = computed(() => [route.path])

const handleHorizontalMenuClick = ({ key }: { key: string | number }) => {
  if (typeof key === 'string' && key.startsWith('/')) {
    router.push(key)
  }
}

onMounted(() => {
  layoutStore.initLayout()
})
</script>

<style scoped lang="scss">
.admin-layout {
  height: 100vh;
  min-height: 100vh;
  background: var(--color-bg-layout);
  overflow: hidden;

  &.vertical {
    display: flex;

    .layout-main {
      flex: 1;
      min-width: 0;
      min-height: 100vh;
      height: 100vh;
      display: flex;
      flex-direction: column;
      transition: margin-left var(--duration-slow) var(--ease-out);
      overflow: hidden;
    }
  }

  &.horizontal {
    display: flex;
    flex-direction: column;

    .horizontal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--spacing-lg);
      background: var(--color-bg-container);
      box-shadow: var(--shadow-1);
      box-sizing: border-box;
      height: 50px;
      line-height: 49px;
      border-bottom: 1px solid var(--color-border-secondary);
      flex-shrink: 0;

      .header-left {
        display: flex;
        align-items: stretch;
        flex: 1;
        min-width: 0;

        .logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          flex-shrink: 0;
          height: 100%;

          img {
            width: 32px;
            height: 32px;
          }

          .logo-title {
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-semibold);
            color: var(--color-text-primary);
          }
        }

        .horizontal-main-menu {
          flex: 1;
          min-width: 0;
          margin-left: var(--spacing-lg);
          background: transparent;
          border-bottom: none;
          --ant-menu-horizontal-line-height: 49px;
          --ant-menu-item-height: 49px;
          // Header is 50px and includes 1px bottom border.
          // Keep menu inside content box (49px) and align active bar to header border.
          height: calc(100% - 1px);
          line-height: 49px;

          :deep(.ant-menu-overflow) {
            height: 100%;
          }

          :deep(.ant-menu-horizontal::after) {
            border-bottom: none !important;
          }

          :deep(.ant-menu-item),
          :deep(.ant-menu-submenu) {
            top: 0;
            height: 49px;
            line-height: 49px;
            margin-top: 0;
            margin-bottom: 0;
          }

          :deep(.ant-menu-submenu-title) {
            height: 49px;
            line-height: 49px;
            display: flex;
            align-items: center;
          }

          :deep(.ant-menu-item::after),
          :deep(.ant-menu-submenu::after) {
            bottom: -1px;
          }

          :deep(.ant-menu-submenu-arrow) {
            display: none;
          }

          :deep(.horizontal-submenu-label) {
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          :deep(.horizontal-submenu-arrow) {
            font-size: 12px;
            color: var(--color-text-tertiary);
          }
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        height: 100%;
        flex-shrink: 0;

        :deep(.admin-header) {
          height: 100%;
          padding: 0;
          background: transparent;
          box-shadow: none;
          border-bottom: none;
        }
      }
    }

    .horizontal-content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      background: var(--color-bg-layout);
    }

    > :deep(.ant-layout) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
  }

  .page-content {
    flex: 1;
    min-height: 0;
    box-sizing: border-box;
    padding: 16px;
    background: var(--color-bg-layout);
  }

  .page-scroll {
    height: 100%;
    overflow: auto;
    overscroll-behavior: contain;
  }

  .page-scroll :deep(.page-container) {
    min-height: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &.mobile {
    .layout-main {
      margin-left: 0 !important;
    }
  }
}
</style>
