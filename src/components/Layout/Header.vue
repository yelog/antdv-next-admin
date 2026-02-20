<template>
  <a-layout-header class="admin-header">
    <div class="header-left">
      <!-- Collapse Button -->
      <a-button
        v-if="showCollapseButton"
        type="text"
        class="collapse-btn"
        @click="layoutStore.toggleSidebar"
      >
        <MenuFoldOutlined v-if="!layoutStore.collapsed" />
        <MenuUnfoldOutlined v-else />
      </a-button>

      <!-- Breadcrumb -->
      <Breadcrumb v-if="showBreadcrumb" />
    </div>

    <div class="header-right">
      <!-- Global Search Trigger -->
      <a-button type="text" class="header-action search-btn" @click="openGlobalSearch">
        <SearchOutlined />
      </a-button>
      <div class="search-trigger desktop-only" @click="openGlobalSearch">
        <SearchOutlined class="search-icon" />
        <span class="search-text">{{ $t('common.search') }}</span>
        <div class="search-key">
          <span class="search-key-text">{{ isMac ? '⌘' : 'Ctrl' }}</span>
          <span class="search-key-k">K</span>
        </div>
      </div>

      <!-- Desktop: Show all actions -->
      <template v-if="!layoutStore.isMobile">
        <a-tooltip :title="layoutStore.aiCollabEnabled ? $t('layout.aiCollabDisable') : $t('layout.aiCollabEnable')">
          <a-button
            type="text"
            class="header-action ai-toggle-btn"
            :class="{ active: layoutStore.aiCollabEnabled }"
            @click="layoutStore.toggleAiCollab"
          >
            <MessageOutlined />
          </a-button>
        </a-tooltip>

        <!-- Fullscreen Toggle -->
        <FullscreenToggle />

        <!-- Notifications -->
        <NotificationPanel />

        <!-- Theme Toggle -->
        <ThemeToggle />

        <!-- Language Switch -->
        <LanguageSwitch />

        <!-- Settings -->
        <a-tooltip :title="$t('settings.title')">
          <a-button type="text" class="header-action" @click="openSettings">
            <SettingOutlined />
          </a-button>
        </a-tooltip>

        <!-- Divider -->
        <a-divider type="vertical" style="height: 20px; margin: 0 4px;" />
      </template>

      <!-- Mobile: More menu (three dots) -->
      <a-dropdown v-else :trigger="['click']" placement="bottomRight" :menu="moreMenuProps">
        <a-button type="text" class="header-action">
          <MoreOutlined />
        </a-button>
      </a-dropdown>

      <!-- User Avatar Dropdown -->
      <AvatarDropdown />
    </div>

    <!-- Global Search Modal -->
    <GlobalSearch ref="globalSearchRef" />

    <!-- Settings Drawer -->
    <SettingsDrawer ref="settingsDrawerRef" />
  </a-layout-header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, h } from 'vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  SettingOutlined,
  MoreOutlined,
  MessageOutlined,
  FullscreenOutlined,
  BulbOutlined,
  GlobalOutlined
} from '@antdv-next/icons'
import { useLayoutStore } from '@/stores/layout'
import { useThemeStore } from '@/stores/theme'
import { $t, setLocale, LOCALE_NATIVE_LABELS } from '@/locales'
import Breadcrumb from './Breadcrumb.vue'
import FullscreenToggle from './FullscreenToggle.vue'
import NotificationPanel from './NotificationPanel.vue'
import ThemeToggle from './ThemeToggle.vue'
import LanguageSwitch from './LanguageSwitch.vue'
import AvatarDropdown from './AvatarDropdown.vue'
import GlobalSearch from './GlobalSearch.vue'
import SettingsDrawer from './SettingsDrawer.vue'

interface Props {
  showBreadcrumb?: boolean
  showCollapseButton?: boolean
}

withDefaults(defineProps<Props>(), {
  showBreadcrumb: true,
  showCollapseButton: true
})

const layoutStore = useLayoutStore()
const themeStore = useThemeStore()
const globalSearchRef = ref()
const settingsDrawerRef = ref()
const isMac = ref(false)

const openGlobalSearch = () => {
  globalSearchRef.value?.open()
}

const openSettings = () => {
  settingsDrawerRef.value?.open()
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

const handleMoreMenuClick = ({ key }: { key: string }) => {
  switch (key) {
    case 'fullscreen':
      toggleFullscreen()
      break
    case 'ai-collab':
      layoutStore.toggleAiCollab()
      break
    case 'theme-light':
      themeStore.setThemeMode('light')
      break
    case 'theme-dark':
      themeStore.setThemeMode('dark')
      break
    case 'theme-auto':
      themeStore.setThemeMode('auto')
      break
    case 'lang-zh':
      setLocale('zh-CN')
      break
    case 'lang-en':
      setLocale('en-US')
      break
    case 'lang-ja':
      setLocale('ja-JP')
      break
    case 'lang-ko':
      setLocale('ko-KR')
      break
    case 'settings':
      openSettings()
      break
  }
}

const moreMenuProps = computed(() => ({
  items: [
    {
      key: 'fullscreen',
      label: $t('layout.fullscreen'),
      icon: h(FullscreenOutlined)
    },
    {
      key: 'ai-collab',
      label: layoutStore.aiCollabEnabled ? $t('layout.aiCollabDisable') : $t('layout.aiCollabEnable'),
      icon: h(MessageOutlined)
    },
    {
      type: 'divider'
    },
    {
      key: 'theme',
      label: $t('layout.theme'),
      icon: h(BulbOutlined),
      children: [
        {
          key: 'theme-light',
          label: $t('layout.themeLight')
        },
        {
          key: 'theme-dark',
          label: $t('layout.themeDark')
        },
        {
          key: 'theme-auto',
          label: $t('layout.themeAuto')
        }
      ]
    },
    {
      key: 'language',
      label: $t('layout.language'),
      icon: h(GlobalOutlined),
      children: [
        {
          key: 'lang-zh',
          label: LOCALE_NATIVE_LABELS['zh-CN']
        },
        {
          key: 'lang-en',
          label: LOCALE_NATIVE_LABELS['en-US']
        },
        {
          key: 'lang-ja',
          label: LOCALE_NATIVE_LABELS['ja-JP']
        },
        {
          key: 'lang-ko',
          label: LOCALE_NATIVE_LABELS['ko-KR']
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      key: 'settings',
      label: $t('settings.title'),
      icon: h(SettingOutlined)
    }
  ],
  onClick: handleMoreMenuClick
}))

const handleKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    openGlobalSearch()
  }
}

onMounted(() => {
  // Simple check for Mac
  isMac.value = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 20px;
  background: var(--color-bg-container);
  box-shadow: var(--shadow-1);
  height: 50px;
  line-height: 50px;
  border-bottom: 1px solid var(--color-border-secondary);

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    .collapse-btn {
      font-size: 16px;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-base);
      color: var(--color-text-secondary);
      transition: all var(--duration-base) var(--ease-out);

      &:hover {
        background: var(--color-bg-layout);
        color: var(--color-text-primary);
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 0;

    .search-btn {
      display: none;
    }

    .search-trigger {
      display: flex;
      align-items: center;
      height: 32px;
      padding: 0 6px 0 10px;
      margin-right: 12px;
      background: var(--color-bg-layout);
      border: 1px solid transparent;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--color-text-secondary);

      &:hover {
        background: var(--color-bg-container);
        border-color: var(--color-primary);
        color: var(--color-text-primary);

        .search-key {
          border-color: var(--color-primary-3);
          color: var(--color-primary);
          background: var(--color-primary-1);
        }
      }

      .search-icon {
        font-size: 14px;
        margin-right: 8px;
      }

      .search-text {
        font-size: 13px;
        margin-right: 12px;
        line-height: 1;
        opacity: 0.8;
      }

      .search-key {
        display: flex;
        align-items: center;
        gap: 2px;
        height: 20px;
        padding: 0 6px;
        background: var(--color-bg-container);
        border: 1px solid var(--color-border-secondary);
        border-radius: 4px;
        font-size: 12px;
        color: var(--color-text-tertiary);
        line-height: 18px;
        font-family: var(--font-family-code);
        transition: all 0.2s;
      }
    }

    .header-action {
      font-size: 16px;
      width: 32px;
      height: 32px;
      padding: 0 !important;
      border-radius: 8px;
      color: var(--color-text-secondary);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: var(--color-bg-layout);
        color: var(--color-text-primary);
      }
    }

    .ai-toggle-btn.active {
      color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 12%, transparent);
    }

    // Ensure buttons in nested components follow the same style.
    :deep(.header-action) {
      font-size: 16px;
      width: 32px;
      height: 32px;
      padding: 0 !important;
      border-radius: 8px;
      color: var(--color-text-secondary);
    }

    :deep(.header-action:hover) {
      background: var(--color-bg-layout);
      color: var(--color-text-primary);
    }
  }

  :deep(.ant-divider-vertical) {
    border-inline-start-color: var(--color-border-secondary);
  }

  // Mobile styles
  @media (max-width: 768px) {
    .header-right {
      .search-btn {
        display: flex;
      }

      .desktop-only {
        display: none;
      }
    }
  }
}
</style>
