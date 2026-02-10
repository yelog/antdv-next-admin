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
              <span>{{ getTabLabel(tab) }}</span>
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
import { resolveLocaleText } from '@/utils/i18n'

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

const handleContextMenu = (e: { key: string }, tab: Tab) => {
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

const getTabLabel = (tab: Tab) => {
  return resolveLocaleText(tab.title, tab.name)
}
</script>

<style scoped lang="scss">
.tab-bar {
  background: var(--color-bg-container);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0 24px;

  .tabs-container {
    :deep(.ant-tabs) {
      .ant-tabs-nav {
        margin: 0;
        padding: 8px 0;

        &::before {
          border-bottom: none;
        }
      }

      .ant-tabs-tab {
        border: none !important;
        background: transparent;
        margin-right: 8px;
        padding: 8px 16px;
        border-radius: 8px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        .ant-tabs-tab-btn {
          color: rgba(0, 0, 0, 0.65);
          font-weight: 400;
          font-size: 14px;
        }

        &:hover {
          background: rgba(0, 0, 0, 0.04);

          .ant-tabs-tab-btn {
            color: rgba(0, 0, 0, 0.88);
          }
        }

        &.ant-tabs-tab-active {
          background: var(--color-primary);

          .ant-tabs-tab-btn {
            color: #ffffff;
            font-weight: 500;
          }

          .ant-tabs-tab-remove {
            color: rgba(255, 255, 255, 0.85);

            &:hover {
              color: #ffffff;
            }
          }
        }

        .ant-tabs-tab-remove {
          margin-left: 8px;
          color: rgba(0, 0, 0, 0.45);
          transition: color 0.2s;

          &:hover {
            color: rgba(0, 0, 0, 0.88);
          }
        }
      }
    }
  }
}
</style>
