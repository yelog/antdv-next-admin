<template>
  <div class="tab-bar" v-if="tabsStore.tabs.length > 0">
    <div class="tabs-container">
      <a-tabs
        v-model:activeKey="activeKey"
        type="editable-card"
        :hide-add="true"
        @edit="handleEdit"
        @change="handleChange"
      >
        <a-tab-pane
          v-for="tab in tabsStore.tabs"
          :key="tab.path"
          :closable="tab.closable"
        >
          <template #tab>
            <a-dropdown :trigger="['contextmenu']">
              <span>{{ tab.name }}</span>
              <template #overlay>
                <a-menu @click="(e) => handleContextMenu(e, tab)">
                  <a-menu-item key="refresh">
                    <ReloadOutlined />
                    {{ $t('layout.tabs.refresh') }}
                  </a-menu-item>
                  <a-menu-item key="close" :disabled="!tab.closable">
                    <CloseOutlined />
                    {{ $t('layout.tabs.close') }}
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="closeOthers">
                    <CloseCircleOutlined />
                    {{ $t('layout.tabs.closeOthers') }}
                  </a-menu-item>
                  <a-menu-item key="closeAll">
                    <CloseSquareOutlined />
                    {{ $t('layout.tabs.closeAll') }}
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="closeLeft">
                    <VerticalLeftOutlined />
                    {{ $t('layout.tabs.closeLeft') }}
                  </a-menu-item>
                  <a-menu-item key="closeRight">
                    <VerticalRightOutlined />
                    {{ $t('layout.tabs.closeRight') }}
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ReloadOutlined,
  CloseOutlined,
  CloseCircleOutlined,
  CloseSquareOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined
} from '@antdv-next/icons'
import { useTabsStore } from '@/stores/tabs'
import type { Tab } from '@/types/layout'

const router = useRouter()
const tabsStore = useTabsStore()

const activeKey = computed({
  get: () => tabsStore.activeTabPath,
  set: (value) => tabsStore.setActiveTab(value)
})

const handleEdit = (targetKey: string) => {
  tabsStore.closeTab(targetKey)
}

const handleChange = (key: string) => {
  const tab = tabsStore.tabs.find(t => t.path === key)
  if (tab) {
    router.push(tab.fullPath)
  }
}

const handleContextMenu = (e: any, tab: Tab) => {
  const { key } = e
  switch (key) {
    case 'refresh':
      tabsStore.refreshTab(tab.path)
      break
    case 'close':
      tabsStore.closeTab(tab.path)
      break
    case 'closeOthers':
      tabsStore.closeOtherTabs(tab.path)
      break
    case 'closeAll':
      tabsStore.closeAllTabs()
      router.push('/dashboard')
      break
    case 'closeLeft':
      tabsStore.closeLeftTabs(tab.path)
      break
    case 'closeRight':
      tabsStore.closeRightTabs(tab.path)
      break
  }
}
</script>

<style scoped lang="scss">
.tab-bar {
  background: var(--color-bg-container);
  border-bottom: 1px solid var(--color-border-secondary);
  padding: 0 var(--spacing-md);

  .tabs-container {
    :deep(.ant-tabs) {
      .ant-tabs-nav {
        margin: 0;
        padding: 4px 0;

        &::before {
          border-bottom: none;
        }
      }

      .ant-tabs-tab {
        border: 1px solid var(--color-border-secondary) !important;
        background: var(--color-bg-layout);
        margin-right: 4px;
        transition: all var(--duration-base) var(--ease-out);

        &:hover {
          background: var(--color-bg-container);
        }

        &.ant-tabs-tab-active {
          background: var(--color-bg-container);
          border-color: var(--color-primary) !important;

          .ant-tabs-tab-btn {
            color: var(--color-primary);
          }
        }
      }
    }
  }
}
</style>
