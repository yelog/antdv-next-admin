<template>
  <a-layout class="admin-layout" :class="[settingsStore.layoutMode, { mobile: layoutStore.isMobile }]">
    <!-- Vertical Layout -->
    <template v-if="settingsStore.layoutMode === 'vertical'">
      <!-- Sidebar -->
      <Sidebar />

      <!-- Main Content -->
      <a-layout
        class="layout-main"
        :style="{ marginLeft: layoutStore.isMobile ? '0px' : `${layoutStore.getCurrentSidebarWidth()}px` }"
      >
        <!-- Header -->
        <Header />

        <!-- Tabs -->
        <TabBar />

        <!-- Page Content -->
        <a-layout-content class="page-content">
          <router-view v-slot="{ Component }">
            <transition :name="settingsStore.pageAnimation" mode="out-in">
              <keep-alive :include="cachedTabs">
                <component :is="Component" :key="$route.fullPath" />
              </keep-alive>
            </transition>
          </router-view>
        </a-layout-content>
      </a-layout>
    </template>

    <!-- Horizontal Layout -->
    <template v-else>
      <a-layout-header class="horizontal-header">
        <div class="header-left">
          <div class="logo">
            <img src="/logo.svg" alt="Logo" />
            <span class="logo-title">{{ $t('common.appName') || 'Antdv Next Admin' }}</span>
          </div>
        </div>
        <div class="header-right">
          <Header :show-breadcrumb="false" />
        </div>
      </a-layout-header>

      <a-layout>
        <!-- Horizontal Menu -->
        <div class="horizontal-menu">
          <!-- Menu items will go here -->
        </div>

        <a-layout-content class="horizontal-content">
          <!-- Tabs -->
          <TabBar />

          <!-- Page Content -->
          <div class="page-content">
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
  </a-layout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useLayoutStore } from '@/stores/layout'
import { useSettingsStore } from '@/stores/settings'
import { useTabsStore } from '@/stores/tabs'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import TabBar from './TabBar.vue'

const layoutStore = useLayoutStore()
const settingsStore = useSettingsStore()
const tabsStore = useTabsStore()

const cachedTabs = computed(() => tabsStore.cachedTabs)

onMounted(() => {
  layoutStore.initLayout()
})
</script>

<style scoped lang="scss">
.admin-layout {
  min-height: 100vh;
  background: var(--color-bg-layout);

  &.vertical {
    display: flex;

    .layout-main {
      flex: 1;
      transition: margin-left var(--duration-slow) var(--ease-out);
    }
  }

  &.horizontal {
    .horizontal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--spacing-lg);
      background: var(--color-bg-container);
      box-shadow: var(--shadow-1);
      height: 64px;

      .header-left {
        display: flex;
        align-items: center;

        .logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

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
      }
    }

    .horizontal-menu {
      background: var(--color-bg-container);
      border-bottom: 1px solid var(--color-border-secondary);
      padding: 0 var(--spacing-lg);
    }

    .horizontal-content {
      background: var(--color-bg-layout);
    }
  }

  .page-content {
    padding: 24px;
    min-height: calc(100vh - 120px);
    background: var(--color-bg-layout);
  }

  &.mobile {
    .layout-main {
      margin-left: 0 !important;
    }
  }
}
</style>
