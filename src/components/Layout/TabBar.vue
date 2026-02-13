<template>
  <div class="tab-bar" v-if="tabsStore.tabs.length > 0">
    <div class="tabs-container">
      <a-tabs
        v-model:activeKey="activeKey"
        type="editable-card"
        :hide-add="true"
        :items="tabItems"
        @edit="handleEdit"
        @change="handleChange"
      />
    </div>
    <div class="tab-actions">
      <a-dropdown placement="bottomRight" :menu="activeTabMenuProps" :trigger="['click']">
        <a-tooltip :title="$t('layout.tabs.moreActions')">
          <a-button type="text" class="tab-action-btn">
            <DownOutlined />
          </a-button>
        </a-tooltip>
      </a-dropdown>
      <a-tooltip :title="$t('layout.tabs.refresh')">
        <a-button type="text" class="tab-action-btn" @click="refreshCurrentTab">
          <ReloadOutlined />
        </a-button>
      </a-tooltip>
      <a-tooltip :title="isFullscreen ? $t('layout.exitFullscreen') : $t('layout.fullscreen')">
        <a-button type="text" class="tab-action-btn" @click="toggleFullscreen">
          <FullscreenExitOutlined v-if="isFullscreen" />
          <FullscreenOutlined v-else />
        </a-button>
      </a-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Dropdown } from 'antdv-next'
import {
  ReloadOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  DownOutlined,
  CloseOutlined,
  PushpinOutlined,
  PushpinFilled,
  CloseCircleOutlined,
  CloseSquareOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined
} from '@antdv-next/icons'
import { useTabsStore } from '@/stores/tabs'
import { useLayoutStore } from '@/stores/layout'
import type { Tab } from '@/types/layout'
import { resolveLocaleText } from '@/utils/i18n'
import { resolveIcon } from '@/utils/icon'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const tabsStore = useTabsStore()
const layoutStore = useLayoutStore()

const isFullscreen = computed(() => layoutStore.pageFullscreen)
const toggleFullscreen = () => {
  layoutStore.togglePageFullscreen()
}

type TabMenuKey =
  | 'close'
  | 'pin'
  | 'refresh'
  | 'closeLeft'
  | 'closeRight'
  | 'closeOthers'
  | 'closeAll'

const activeKey = computed({
  get: () => tabsStore.activeTabPath,
  set: (value) => tabsStore.setActiveTab(value)
})

const currentTab = computed(() => {
  return tabsStore.activeTab || tabsStore.tabs[0]
})

const tabItems = computed(() => {
  // Access locale to establish reactivity dependency on language changes
  const currentLocale = locale.value
  // Keep locale dependency but don't use it as a key to avoid forced remounts
  void currentLocale
  
  return tabsStore.tabs.map(tab => ({
    key: tab.path,
    closable: tab.closable,
    label: h('span', { class: 'tab-label-wrapper' }, [
        h(
          Dropdown,
          {
            trigger: ['contextmenu'],
            menu: {
            items: getTabMenuItems(tab),
            onClick: ({ key }: { key: string | number }) => handleContextMenu({ key: String(key) }, tab)
          }
        },
        {
          default: () => {
            const icon = getTabIcon(tab)
            return h('span', { class: 'tab-label' }, [
              icon ? h(icon, { class: 'tab-menu-icon' }) : null,
              h('span', { class: 'tab-text' }, getTabLabel(tab)),
              isTabFixed(tab) ? h(PushpinFilled, { class: 'tab-pin-icon' }) : null
            ])
          }
        }
      )
    ])
  }))
})

const isTabFixed = (tab: Tab) => Boolean(tab.affix || tab.pinned)

const handleEdit = (targetKey: string) => {
  tabsStore.closeTab(targetKey)
  syncRouteWithActiveTab()
}

const handleChange = (key: string) => {
  const tab = tabsStore.tabs.find(t => t.path === key)
  if (tab) {
    router.push(tab.fullPath)
  }
}

const hasClosableLeftTabs = (tab: Tab) => {
  const index = tabsStore.tabs.findIndex(item => item.path === tab.path)
  if (index <= 0) return false
  return tabsStore.tabs.slice(0, index).some(item => item.closable)
}

const hasClosableRightTabs = (tab: Tab) => {
  const index = tabsStore.tabs.findIndex(item => item.path === tab.path)
  if (index < 0 || index >= tabsStore.tabs.length - 1) return false
  return tabsStore.tabs.slice(index + 1).some(item => item.closable)
}

const hasClosableOtherTabs = (tab: Tab) => {
  return tabsStore.tabs.some(item => item.path !== tab.path && item.closable)
}

const hasClosableTabs = computed(() => {
  return tabsStore.tabs.some(tab => tab.closable)
})

const getTabMenuItems = (tab: Tab) => {
  // Call t() function to get reactive translations
  return [
    {
      key: 'close',
      icon: h(CloseOutlined),
      label: t('layout.tabs.close'),
      disabled: !tab.closable
    },
    {
      key: 'pin',
      icon: h(tab.pinned ? PushpinFilled : PushpinOutlined),
      label: tab.pinned ? t('layout.tabs.unpin') : t('layout.tabs.pin'),
      disabled: Boolean(tab.affix)
    },
    {
      key: 'refresh',
      icon: h(ReloadOutlined),
      label: t('layout.tabs.refresh')
    },
    {
      type: 'divider'
    },
    {
      key: 'closeLeft',
      icon: h(VerticalLeftOutlined),
      label: t('layout.tabs.closeLeft'),
      disabled: !hasClosableLeftTabs(tab)
    },
    {
      key: 'closeRight',
      icon: h(VerticalRightOutlined),
      label: t('layout.tabs.closeRight'),
      disabled: !hasClosableRightTabs(tab)
    },
    {
      key: 'closeOthers',
      icon: h(CloseCircleOutlined),
      label: t('layout.tabs.closeOthers'),
      disabled: !hasClosableOtherTabs(tab)
    },
    {
      key: 'closeAll',
      icon: h(CloseSquareOutlined),
      label: t('layout.tabs.closeAll'),
      disabled: !hasClosableTabs.value
    }
  ]
}

const syncRouteWithActiveTab = () => {
  const active = tabsStore.tabs.find(tab => tab.path === tabsStore.activeTabPath) || tabsStore.tabs[0]
  if (!active) {
    if (route.path !== '/dashboard') {
      router.push('/dashboard')
    }
    return
  }

  if (route.path !== active.path || route.fullPath !== active.fullPath) {
    router.push(active.fullPath)
  }
}

const handleContextMenu = (e: { key: string }, tab: Tab) => {
  const { key } = e
  switch (key as TabMenuKey) {
    case 'close':
      tabsStore.closeTab(tab.path)
      syncRouteWithActiveTab()
      break
    case 'pin':
      tabsStore.togglePinTab(tab.path)
      break
    case 'refresh':
      tabsStore.refreshTab(tab.path)
      break
    case 'closeOthers':
      tabsStore.closeOtherTabs(tab.path)
      syncRouteWithActiveTab()
      break
    case 'closeAll':
      tabsStore.closeAllTabs()
      syncRouteWithActiveTab()
      break
    case 'closeLeft':
      tabsStore.closeLeftTabs(tab.path)
      syncRouteWithActiveTab()
      break
    case 'closeRight':
      tabsStore.closeRightTabs(tab.path)
      syncRouteWithActiveTab()
      break
  }
}


const activeTabMenuProps = computed(() => {
  // Access locale to establish reactivity dependency on language changes
  const currentLocale = locale.value
  void currentLocale // Ensure reactivity
  
  const tab = currentTab.value
  return {
    items: tab ? getTabMenuItems(tab) : [],
    onClick: ({ key }: { key: string | number }) => {
      if (tab) {
        handleContextMenu({ key: String(key) }, tab)
      }
    }
  }
})

const refreshCurrentTab = () => {
  const tab = currentTab.value
  if (!tab) return
  tabsStore.refreshTab(tab.path)
}

const getTabLabel = (tab: Tab) => {
  return resolveLocaleText(tab.title, tab.name)
}

const getTabIcon = (tab: Tab) => {
  return resolveIcon(tab.icon)
}
</script>

<style scoped lang="scss">
.tab-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  height: 38px;
  background: var(--color-bg-container);
  border-bottom: 1px solid var(--color-border-secondary);
  padding: 0 12px 0 16px;

  .tabs-container {
    flex: 1;
    min-width: 0;

    :deep(.ant-tabs) {
      height: 37px;

      .ant-tabs-nav {
        margin: 0;
        height: 37px;

        &::before {
          border-bottom: none;
        }
      }

      .ant-tabs-nav-wrap,
      .ant-tabs-nav-list {
        height: 100%;
        align-items: center;
      }

      .ant-tabs-content-holder {
        display: none;
      }

      .ant-tabs-tab .anticon:not(:last-child) {
        margin-right: 0;
      }

      .ant-tabs-tab {
        border: 1px solid transparent !important;
        background: var(--color-bg-layout);
        margin-right: 6px;
        padding: 0 10px;
        height: 28px;
        border-radius: 8px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        .ant-tabs-tab-btn {
          display: flex;
          align-items: center;
          color: var(--color-text-secondary);
          font-weight: 400;
          font-size: 13px;
        }

        &:hover {
          background: var(--color-bg-container);
          border-color: var(--color-border-secondary);

          .ant-tabs-tab-btn {
            color: var(--color-text-primary);
          }
        }

        &.ant-tabs-tab-active {
          background: var(--color-primary-1);
          border-color: var(--color-primary-2);

          .ant-tabs-tab-btn {
            color: var(--color-primary);
            font-weight: 400;
          }

          .ant-tabs-tab-remove {
            color: var(--color-primary);

            &:hover {
              color: var(--color-primary-7);
            }
          }
        }

        .ant-tabs-tab-remove {
          margin-left: 6px;
          color: var(--color-text-tertiary);
          transition: color 0.2s;
          font-size: 12px;

          &:hover {
            color: var(--color-text-primary);
          }
        }
      }
    }
  }

  // Dark mode specific overrides moved to global style block below to ensure priority
  .tab-actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: 2px;

    .tab-action-btn {
      width: 28px;
      height: 28px;
      padding: 0;
      border-radius: 6px;
      color: var(--color-text-secondary);

      &:hover {
        color: var(--color-text-primary);
        background: var(--color-bg-layout);
      }
    }
  }

  // Use :deep() to ensure styles apply even when VNodes are cloned by a-tabs
  :deep(.tab-label) {
    display: inline-flex;
    align-items: center;
    max-width: 180px;
    gap: 6px;
  }

  :deep(.tab-menu-icon) {
    font-size: 14px;
    color: inherit;
  }

  :deep(.tab-pin-icon) {
    font-size: 12px;
    color: var(--color-warning);
  }

  :deep(.tab-text) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>

<style lang="scss">
// Global style overrides for dark mode
// Using non-scoped style to ensure we can target Ant Design internals reliably
html.dark .tab-bar .ant-tabs-tab.ant-tabs-tab-active {
  background: rgba(22, 119, 255, 0.25) !important;
  border-color: transparent !important;

  .ant-tabs-tab-btn {
    color: #ffffff !important;
  }

  .ant-tabs-tab-remove {
    color: rgba(255, 255, 255, 0.65) !important;

    &:hover {
      color: #ffffff !important;
    }
  }
}
</style>
