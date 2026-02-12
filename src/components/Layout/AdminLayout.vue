<template>
  <a-watermark v-bind="watermarkStore.watermarkProps" class="global-watermark">
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

          <div ref="menuAreaRef" class="horizontal-menu-area">
            <a-menu
              class="horizontal-main-menu"
              mode="horizontal"
              :disabled-overflow="true"
              :selected-keys="horizontalSelectedKeys"
              :items="visibleHorizontalMenuItems"
              trigger-sub-menu-action="hover"
              @click="handleHorizontalMenuClick"
            />
            <a-dropdown
              v-if="overflowHorizontalMenuItems.length > 0"
              :menu="overflowMenuProps"
              :trigger="['hover']"
              placement="bottomRight"
            >
              <a-button type="text" class="horizontal-overflow-trigger">
                <EllipsisOutlined />
              </a-button>
            </a-dropdown>
          </div>
        </div>
        <div class="header-right">
          <Header :show-breadcrumb="false" :show-collapse-button="false" />
        </div>
        <div ref="measureMenuWrapRef" class="horizontal-menu-measure-wrap" aria-hidden="true">
          <a-menu
            class="horizontal-menu-measure"
            mode="horizontal"
            :disabled-overflow="true"
            :items="horizontalMenuItems"
          />
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
  </a-watermark>
</template>

<script setup lang="ts">
import { computed, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { MenuProps } from 'antdv-next'
import { DownOutlined, EllipsisOutlined } from '@antdv-next/icons'
import { useLayoutStore } from '@/stores/layout'
import { useSettingsStore } from '@/stores/settings'
import { useTabsStore } from '@/stores/tabs'
import { usePermissionStore } from '@/stores/permission'
import { useWatermarkStore } from '@/stores/watermark'
import { basicRoutes } from '@/router/routes'
import { routesToMenuTree } from '@/router/utils'
import type { MenuItem as MenuItemType } from '@/types/router'
import { resolveLocaleText } from '@/utils/i18n'
import { resolveIcon } from '@/utils/icon'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import TabBar from './TabBar.vue'

type HorizontalMenuItems = NonNullable<MenuProps['items']>

const route = useRoute()
const router = useRouter()
const layoutStore = useLayoutStore()
const settingsStore = useSettingsStore()
const tabsStore = useTabsStore()
const permissionStore = usePermissionStore()
const watermarkStore = useWatermarkStore()

const menuAreaRef = ref<HTMLElement>()
const measureMenuWrapRef = ref<HTMLElement>()
const measuredTopMenuWidths = ref<number[]>([])
const visibleMenuCount = ref(0)
const OVERFLOW_TRIGGER_WIDTH = 36
let resizeObserver: ResizeObserver | null = null
let rafId = 0

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

const convertHorizontalMenus = (
  menus: MenuItemType[],
  showCustomSubmenuArrow: boolean
): HorizontalMenuItems => {
  const convert = (list: MenuItemType[]): HorizontalMenuItems => {
    return list.map(menu => {
      const iconComponent = resolveIcon(menu.icon)
      const text = resolveLocaleText(menu.label, menu.id)
      const childMenus = menu.children || []
      const hasChildren = childMenus.length > 0
      const label = hasChildren && showCustomSubmenuArrow
        ? h('span', { class: 'horizontal-submenu-label' }, [
          h('span', { class: 'horizontal-submenu-text' }, text),
          h(DownOutlined, { class: 'horizontal-submenu-arrow' })
        ])
        : text

      const item = {
        key: menu.path || menu.id,
        label,
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

  return convert(menus)
}

const horizontalMenuItems = computed<HorizontalMenuItems>(() => {
  return convertHorizontalMenus(menuItems.value, true)
})

const dropdownOverflowMenuItems = computed<HorizontalMenuItems>(() => {
  return convertHorizontalMenus(menuItems.value, false)
})

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

const horizontalSelectedKeys = computed(() => {
  const currentMenuItem = findMenuByPath(menuItems.value, route.path)
  
  // Don't set selected state if current menu item is an external link
  if (currentMenuItem && currentMenuItem.path && isExternalLinkPath(currentMenuItem.path)) {
    return []
  }
  
  return [route.path]
})
const normalizedVisibleMenuCount = computed(() => {
  return Math.max(0, Math.min(visibleMenuCount.value, horizontalMenuItems.value.length))
})

const visibleHorizontalMenuItems = computed<HorizontalMenuItems>(() => {
  return horizontalMenuItems.value.slice(0, normalizedVisibleMenuCount.value)
})

const overflowHorizontalMenuItems = computed<HorizontalMenuItems>(() => {
  return dropdownOverflowMenuItems.value.slice(normalizedVisibleMenuCount.value)
})

const handleHorizontalMenuClick = ({ key }: { key: string | number }) => {
  if (typeof key === 'string' && key.startsWith('/')) {
    router.push(key)
  }
}

const overflowMenuProps = computed(() => ({
  items: overflowHorizontalMenuItems.value,
  triggerSubMenuAction: 'hover' as const,
  onClick: handleHorizontalMenuClick
}))

const measureHorizontalMenuItemWidths = () => {
  const wrap = measureMenuWrapRef.value
  if (!wrap) {
    measuredTopMenuWidths.value = []
    return
  }

  const itemElements = wrap.querySelectorAll('.ant-menu-root > .ant-menu-item, .ant-menu-root > .ant-menu-submenu')
  measuredTopMenuWidths.value = Array.from(itemElements).map((element) => {
    return Math.ceil((element as HTMLElement).getBoundingClientRect().width)
  })
}

const recalculateVisibleMenuCount = () => {
  const totalCount = horizontalMenuItems.value.length
  if (totalCount === 0) {
    visibleMenuCount.value = 0
    return
  }

  const areaWidth = menuAreaRef.value?.clientWidth || 0
  if (!areaWidth) {
    visibleMenuCount.value = totalCount
    return
  }

  const widths = measuredTopMenuWidths.value
  if (widths.length !== totalCount) {
    visibleMenuCount.value = totalCount
    return
  }

  const totalWidth = widths.reduce((sum, width) => sum + width, 0)
  if (totalWidth <= areaWidth) {
    visibleMenuCount.value = totalCount
    return
  }

  const maxWidth = Math.max(0, areaWidth - OVERFLOW_TRIGGER_WIDTH)
  let used = 0
  let count = 0

  widths.forEach((width) => {
    if (used + width <= maxWidth) {
      used += width
      count += 1
    }
  })

  visibleMenuCount.value = count
}

const scheduleMenuLayout = () => {
  if (rafId) {
    cancelAnimationFrame(rafId)
  }

  rafId = requestAnimationFrame(() => {
    rafId = 0
    nextTick(() => {
      measureHorizontalMenuItemWidths()
      recalculateVisibleMenuCount()
    })
  })
}

onMounted(() => {
  layoutStore.initLayout()
  scheduleMenuLayout()

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      scheduleMenuLayout()
    })

    if (menuAreaRef.value) resizeObserver.observe(menuAreaRef.value)
    if (measureMenuWrapRef.value) resizeObserver.observe(measureMenuWrapRef.value)
  }
})

onBeforeUnmount(() => {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(
  [horizontalMenuItems, dropdownOverflowMenuItems],
  () => {
    scheduleMenuLayout()
  },
  { deep: true }
)

watch(
  () => settingsStore.layoutMode,
  () => {
    scheduleMenuLayout()
  }
)

watch(
  () => route.path,
  () => {
    scheduleMenuLayout()
  }
)
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
        overflow: hidden;

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

        .horizontal-menu-area {
          flex: 1;
          min-width: 0;
          height: 100%;
          margin-left: var(--spacing-lg);
          display: flex;
          align-items: stretch;
          overflow: hidden;
        }

        .horizontal-main-menu {
          flex: 1;
          min-width: 0;
          background: transparent;
          border-bottom: none;
          --ant-menu-horizontal-line-height: 49px;
          --ant-menu-item-height: 49px;
          height: calc(100% - 1px);
          line-height: 49px;

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
            white-space: nowrap;
          }

          :deep(.ant-menu-submenu-title) {
            height: 49px;
            line-height: 49px;
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

        .horizontal-overflow-trigger {
          flex-shrink: 0;
          width: 36px;
          height: 49px;
          padding: 0;
          border-radius: 0;
          color: var(--color-text-secondary);

          &:hover {
            background: var(--color-bg-layout);
            color: var(--color-text-primary);
          }
        }
      }

      .horizontal-menu-measure-wrap {
        position: absolute;
        visibility: hidden;
        pointer-events: none;
        height: 0;
        overflow: hidden;
      }

      .horizontal-menu-measure {
        border-bottom: none;
        --ant-menu-horizontal-line-height: 49px;
        --ant-menu-item-height: 49px;
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

// Global watermark overlay - must cover fixed elements like Sidebar
.global-watermark {
  :deep(> div:last-child) {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    pointer-events: none !important;
  }
}
</style>
