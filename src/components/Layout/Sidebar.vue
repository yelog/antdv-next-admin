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
          Antdv Next Admin
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
import MenuItem from './MenuItem.vue'

const route = useRoute()
const layoutStore = useLayoutStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])

// Mock menu items - will be replaced with real menu from permission store
const menuItems = computed(() => {
  return [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'DashboardOutlined',
      path: '/dashboard'
    },
    {
      id: 'system',
      label: 'System',
      icon: 'SettingOutlined',
      children: [
        {
          id: 'system-user',
          label: 'User Management',
          icon: 'UserOutlined',
          path: '/system/user'
        },
        {
          id: 'system-role',
          label: 'Role Management',
          icon: 'TeamOutlined',
          path: '/system/role'
        },
        {
          id: 'system-permission',
          label: 'Permission',
          icon: 'SafetyOutlined',
          path: '/system/permission'
        }
      ]
    },
    {
      id: 'examples',
      label: 'Examples',
      icon: 'AppstoreOutlined',
      children: [
        {
          id: 'examples-table',
          label: 'Table',
          icon: 'TableOutlined',
          path: '/examples/table'
        },
        {
          id: 'examples-form',
          label: 'Form',
          icon: 'FormOutlined',
          path: '/examples/form'
        }
      ]
    }
  ]
})

// Update selected keys based on route
watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path]
  },
  { immediate: true }
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
  }

  &.dark {
    background: #001529;

    :deep(.ant-menu) {
      background: #001529;
      color: rgba(255, 255, 255, 0.85);
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
