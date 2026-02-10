<template>
  <a-layout-header class="admin-header">
    <div class="header-left">
      <!-- Collapse Button -->
      <a-button
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
      <!-- Global Search -->
      <a-tooltip :title="$t('layout.searchPlaceholder')">
        <a-button type="text" class="header-action" @click="openGlobalSearch">
          <SearchOutlined />
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
import { ref } from 'vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  SettingOutlined
} from '@antdv-next/icons'
import { useLayoutStore } from '@/stores/layout'
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
}

withDefaults(defineProps<Props>(), {
  showBreadcrumb: true
})

const layoutStore = useLayoutStore()
const globalSearchRef = ref()
const settingsDrawerRef = ref()

const openGlobalSearch = () => {
  globalSearchRef.value?.open()
}

const openSettings = () => {
  settingsDrawerRef.value?.open()
}
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

    // 确保所有子组件的按钮也应用相同样式
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
}
</style>
