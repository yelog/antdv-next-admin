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
      <a-divider type="vertical" style="height: 24px; margin: 0 4px;" />

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
  padding: 0 24px;
  background: var(--color-bg-container);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
  height: 64px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    .collapse-btn {
      font-size: 18px;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-base);
      transition: all var(--duration-base) var(--ease-out);

      &:hover {
        background: var(--color-bg-layout);
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 0;

    .header-action {
      font-size: 18px;
      width: 36px;
      height: 36px;
      padding: 0 !important;
      border-radius: 8px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: rgba(0, 0, 0, 0.04);
        color: var(--color-primary);
      }
    }

    // 确保所有子组件的按钮也应用相同样式
    :deep(.header-action) {
      font-size: 18px;
      width: 36px;
      height: 36px;
      padding: 0 !important;
      border-radius: 8px;
    }
  }
}
</style>
