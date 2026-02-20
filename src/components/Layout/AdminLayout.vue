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
        <a-layout-content class="page-content" :class="{ 'is-iframe-page': isIframePage }">
          <div ref="workspaceRef" class="page-workspace" :class="{ 'is-ai-active': isAICollabActive }">
            <div class="page-workspace-main">
              <div class="page-scroll">
                <router-view v-slot="{ Component }">
                  <transition :name="settingsStore.pageAnimation" mode="out-in">
                    <keep-alive :include="cachedTabs">
                      <component :is="Component" :key="pageViewKey" />
                    </keep-alive>
                  </transition>
                </router-view>
              </div>
            </div>

            <template v-if="isAICollabActive">
              <div
                class="page-workspace-resizer"
                role="separator"
                aria-orientation="vertical"
                @mousedown="startAiResize"
              />
              <AICollabPanel
                class="page-workspace-ai"
                :style="{ width: `${effectiveAiPanelWidth}px` }"
                @close="layoutStore.setAiCollabEnabled(false)"
              />
            </template>
          </div>
        </a-layout-content>
      </a-layout>
    </template>

    <!-- Horizontal Layout -->
    <template v-else>
      <a-layout-header v-if="!layoutStore.pageFullscreen" class="horizontal-header">
        <div class="header-left">
          <div class="logo">
            <img :src="logoImg" alt="Logo" />
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
          <div class="page-content" :class="{ 'is-iframe-page': isIframePage }">
            <div ref="workspaceRef" class="page-workspace" :class="{ 'is-ai-active': isAICollabActive }">
              <div class="page-workspace-main">
                <div class="page-scroll">
                  <router-view v-slot="{ Component }">
                    <transition :name="settingsStore.pageAnimation" mode="out-in">
                      <keep-alive :include="cachedTabs">
                        <component :is="Component" :key="pageViewKey" />
                      </keep-alive>
                    </transition>
                  </router-view>
                </div>
              </div>

              <template v-if="isAICollabActive">
                <div
                  class="page-workspace-resizer"
                  role="separator"
                  aria-orientation="vertical"
                  @mousedown="startAiResize"
                />
                <AICollabPanel
                  class="page-workspace-ai"
                  :style="{ width: `${effectiveAiPanelWidth}px` }"
                  @close="layoutStore.setAiCollabEnabled(false)"
                />
              </template>
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
import logoImg from '@/assets/images/logo.png'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import TabBar from './TabBar.vue'
import AICollabPanel from './AICollabPanel.vue'

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
const MIN_AI_PANEL_WIDTH = 320
const MAX_AI_PANEL_WIDTH = 560
const MIN_MAIN_WORKSPACE_WIDTH = 420
let resizeObserver: ResizeObserver | null = null
let workspaceResizeObserver: ResizeObserver | null = null
let rafId = 0

const workspaceRef = ref<HTMLElement | null>(null)
const workspaceWidth = ref(0)
const isAiResizing = ref(false)

const cachedTabs = computed(() => tabsStore.cachedTabs)
const pageViewKey = computed(() => route.path)

const isIframePage = computed(() => {
  return route.path.includes('/iframe/')
})

const isAICollabActive = computed(() => {
  return layoutStore.aiCollabEnabled && !layoutStore.isMobile && !layoutStore.pageFullscreen
})

const maxAiPanelWidth = computed(() => {
  if (workspaceWidth.value <= 0) {
    return MAX_AI_PANEL_WIDTH
  }
  const limitByWorkspace = workspaceWidth.value - MIN_MAIN_WORKSPACE_WIDTH
  const capped = Math.min(MAX_AI_PANEL_WIDTH, limitByWorkspace)
  return Math.max(MIN_AI_PANEL_WIDTH, capped)
})

const effectiveAiPanelWidth = computed(() => {
  return Math.max(
    MIN_AI_PANEL_WIDTH,
    Math.min(layoutStore.aiPanelWidth, maxAiPanelWidth.value)
  )
})

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
  if (typeof key !== 'string') return

  // External links: open in a new tab
  // No need to change selectedKeys as horizontalSelectedKeys is a computed property
  // based on route.path, which won't change when opening external links
  if (key.startsWith('http://') || key.startsWith('https://')) {
    window.open(key, '_blank', 'noopener,noreferrer')
    return
  }

  // Internal routes
  if (key.startsWith('/')) {
    router.push(key)
  }
}

const overflowMenuProps = computed(() => ({
  items: overflowHorizontalMenuItems.value,
  triggerSubMenuAction: 'hover' as const,
  onClick: handleHorizontalMenuClick
}))

const updateWorkspaceWidth = () => {
  workspaceWidth.value = workspaceRef.value?.getBoundingClientRect().width || 0
}

const syncAiPanelWidth = () => {
  if (!layoutStore.aiCollabEnabled) {
    return
  }

  const clamped = Math.max(
    MIN_AI_PANEL_WIDTH,
    Math.min(layoutStore.aiPanelWidth, maxAiPanelWidth.value)
  )
  if (clamped !== layoutStore.aiPanelWidth) {
    layoutStore.setAiPanelWidth(clamped)
  }
}

const stopAiResize = () => {
  if (!isAiResizing.value) {
    return
  }
  isAiResizing.value = false
  document.body.classList.remove('is-ai-panel-resizing')
}

const handleAiResizeMove = (event: MouseEvent) => {
  if (!isAiResizing.value || !workspaceRef.value) {
    return
  }

  const rect = workspaceRef.value.getBoundingClientRect()
  const nextWidth = rect.right - event.clientX
  const clampedWidth = Math.max(
    MIN_AI_PANEL_WIDTH,
    Math.min(nextWidth, maxAiPanelWidth.value)
  )
  layoutStore.setAiPanelWidth(clampedWidth)
}

const startAiResize = (event: MouseEvent) => {
  if (!isAICollabActive.value) {
    return
  }

  event.preventDefault()
  isAiResizing.value = true
  document.body.classList.add('is-ai-panel-resizing')
}

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
  updateWorkspaceWidth()
  syncAiPanelWidth()
  window.addEventListener('mousemove', handleAiResizeMove)
  window.addEventListener('mouseup', stopAiResize)

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      scheduleMenuLayout()
    })
    workspaceResizeObserver = new ResizeObserver(() => {
      updateWorkspaceWidth()
      syncAiPanelWidth()
    })

    if (menuAreaRef.value) resizeObserver.observe(menuAreaRef.value)
    if (measureMenuWrapRef.value) resizeObserver.observe(measureMenuWrapRef.value)
    if (workspaceRef.value) workspaceResizeObserver.observe(workspaceRef.value)
  }
})

onBeforeUnmount(() => {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
  stopAiResize()
  window.removeEventListener('mousemove', handleAiResizeMove)
  window.removeEventListener('mouseup', stopAiResize)
  resizeObserver?.disconnect()
  resizeObserver = null
  workspaceResizeObserver?.disconnect()
  workspaceResizeObserver = null
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
    nextTick(() => {
      if (workspaceResizeObserver) {
        workspaceResizeObserver.disconnect()
        if (workspaceRef.value) {
          workspaceResizeObserver.observe(workspaceRef.value)
        }
      }
      updateWorkspaceWidth()
      syncAiPanelWidth()
    })
  }
)

watch(
  () => route.path,
  () => {
    scheduleMenuLayout()
  }
)

watch(
  () => layoutStore.isMobile,
  (isMobile) => {
    if (isMobile && layoutStore.aiCollabEnabled) {
      layoutStore.setAiCollabEnabled(false)
    }
  }
)

watch(
  () => layoutStore.pageFullscreen,
  (isFullscreen) => {
    if (isFullscreen && layoutStore.aiCollabEnabled) {
      layoutStore.setAiCollabEnabled(false)
    }
  }
)

watch(
  () => layoutStore.aiCollabEnabled,
  (enabled) => {
    if (enabled) {
      nextTick(() => {
        updateWorkspaceWidth()
        syncAiPanelWidth()
      })
    } else {
      stopAiResize()
    }
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

    &.is-iframe-page {
      .page-scroll {
        overflow: hidden;
      }
    }
  }

  .page-workspace {
    height: 100%;
    min-height: 0;
    display: flex;
    align-items: stretch;
    gap: 0;
  }

  .page-workspace-main {
    flex: 1;
    min-width: 0;
    min-height: 0;
  }

  .page-workspace-ai {
    height: 100%;
    flex-shrink: 0;
  }

  .page-workspace-resizer {
    width: 10px;
    margin: 0 2px;
    cursor: col-resize;
    position: relative;
    flex-shrink: 0;

    &::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 2px;
      height: 42px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--color-primary) 35%, var(--color-border-secondary));
      opacity: 0.4;
      transition: opacity var(--duration-base) var(--ease-out);
    }

    &:hover::before {
      opacity: 0.9;
    }
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

:global(body.is-ai-panel-resizing) {
  cursor: col-resize;
  user-select: none;
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
