<template>
  <div class="page-container">
    <div class="card">
      <h2>{{ $t('exampleSegmented.title') }}</h2>
      <p class="mb-lg">{{ $t('exampleSegmented.description') }}</p>

      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="basic" :tab="$t('exampleSegmented.basicTab')">
          <div class="demo-section">
            <h4>{{ $t('exampleSegmented.basicUsage') }}</h4>
            <a-segmented v-model:value="basicValue" :options="basicOptions" />
            <p class="value-preview">{{ $t('exampleSegmented.currentValue') }}: {{ basicValue }}</p>
          </div>

          <div class="demo-section">
            <h4>{{ $t('exampleSegmented.sizes') }}</h4>
            <a-space direction="vertical">
              <div class="size-item">
                <span>small:</span>
                <a-segmented v-model:value="sizeValue" :options="basicOptions" size="small" />
              </div>
              <div class="size-item">
                <span>default:</span>
                <a-segmented v-model:value="sizeValue" :options="basicOptions" />
              </div>
              <div class="size-item">
                <span>large:</span>
                <a-segmented v-model:value="sizeValue" :options="basicOptions" size="large" />
              </div>
            </a-space>
          </div>
        </a-tab-pane>

        <a-tab-pane key="icon" :tab="$t('exampleSegmented.iconTab')">
          <div class="demo-section">
            <h4>{{ $t('exampleSegmented.iconOptions') }}</h4>
            <a-segmented v-model:value="iconValue" :options="iconOptions" />
            <p class="value-preview">{{ $t('exampleSegmented.currentValue') }}: {{ iconValue }}</p>
          </div>

          <div class="demo-section">
            <h4>{{ $t('exampleSegmented.mixOptions') }}</h4>
            <a-segmented v-model:value="mixValue" :options="mixOptions" />
          </div>
        </a-tab-pane>

        <a-tab-pane key="block" :tab="$t('exampleSegmented.blockTab')">
          <div class="demo-section">
            <h4>{{ $t('exampleSegmented.blockStyle') }}</h4>
            <a-segmented v-model:value="blockValue" :options="basicOptions" block />
          </div>
        </a-tab-pane>

        <a-tab-pane key="disabled" :tab="$t('exampleSegmented.disabledTab')">
          <div class="demo-section">
            <h4>{{ $t('exampleSegmented.allDisabled') }}</h4>
            <a-segmented v-model:value="disabledValue" :options="basicOptions" disabled />
          </div>

          <div class="demo-section">
            <h4>{{ $t('exampleSegmented.partialDisabled') }}</h4>
            <a-segmented v-model:value="partialValue" :options="partialDisabledOptions" />
          </div>
        </a-tab-pane>

        <a-tab-pane key="business" :tab="$t('exampleSegmented.businessTab')">
          <div class="demo-section">
            <h4>{{ $t('exampleSegmented.viewSwitch') }}</h4>
            <div class="view-switch-demo">
              <a-segmented v-model:value="viewMode" :options="viewOptions" />
              <div class="view-content">
                <div v-if="viewMode === 'list'" class="list-view">
                  <div v-for="i in 3" :key="i" class="list-item">
                    <div class="list-item-avatar"></div>
                    <div class="list-item-content">
                      <div class="list-item-title">{{ $t('exampleSegmented.listItemTitle') }} {{ i }}</div>
                      <div class="list-item-desc">{{ $t('exampleSegmented.listItemDesc') }}</div>
                    </div>
                  </div>
                </div>
                <div v-else class="card-view">
                  <div v-for="i in 3" :key="i" class="card-item">
                    <div class="card-item-cover"></div>
                    <div class="card-item-title">{{ $t('exampleSegmented.cardItemTitle') }} {{ i }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="demo-section">
            <h4>{{ $t('exampleSegmented.filterSwitch') }}</h4>
            <a-segmented v-model:value="filterValue" :options="filterOptions" />
            <p class="value-preview">{{ $t('exampleSegmented.filterResult') }}: {{ filterValue }}</p>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AppstoreOutlined,
  BarsOutlined,
  CloudOutlined,
  DesktopOutlined,
  MobileOutlined,
  UnorderedListOutlined,
} from '@antdv-next/icons'
import { h, ref } from 'vue'

const activeTab = ref('basic')

const basicValue = ref('daily')
const basicOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
]

const sizeValue = ref('daily')

const iconValue = ref('list')
const iconOptions = [
  { value: 'list', icon: () => h(UnorderedListOutlined) },
  { value: 'grid', icon: () => h(AppstoreOutlined) },
]

const mixValue = ref('mobile')
const mixOptions = [
  { value: 'mobile', label: 'Mobile', icon: () => h(MobileOutlined) },
  { value: 'desktop', label: 'Desktop', icon: () => h(DesktopOutlined) },
  { value: 'cloud', label: 'Cloud', icon: () => h(CloudOutlined) },
]

const blockValue = ref('map')

const disabledValue = ref('daily')

const partialValue = ref('waiting')
const partialDisabledOptions = [
  { label: 'Waiting', value: 'waiting' },
  { label: 'Processing', value: 'processing', disabled: true },
  { label: 'Done', value: 'done', disabled: true },
]

const viewMode = ref('list')
const viewOptions = [
  { value: 'list', icon: () => h(BarsOutlined) },
  { value: 'card', icon: () => h(AppstoreOutlined) },
]

const filterValue = ref('all')
const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Closed', value: 'closed' },
]

</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}

.demo-section {
  margin-bottom: 32px;

  h4 {
    margin-bottom: 12px;
    font-weight: 500;
  }
}

.value-preview {
  margin-top: 12px;
  padding: 8px 12px;
  background: var(--color-bg-container);
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
}

.size-item {
  display: flex;
  align-items: center;
  gap: 12px;

  span {
    width: 60px;
    color: var(--color-text-secondary);
  }
}

.view-switch-demo {
  .view-content {
    margin-top: 16px;
    padding: 16px;
    background: var(--color-bg-container);
    border-radius: 8px;
    border: 1px solid var(--color-border-secondary);
    min-height: 200px;
  }
}

.list-view {
  .list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-bottom: 1px solid var(--color-border-secondary);

    &:last-child {
      border-bottom: none;
    }
  }

  .list-item-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--color-primary-bg-hover);
  }

  .list-item-content {
    flex: 1;
  }

  .list-item-title {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .list-item-desc {
    font-size: 13px;
    color: var(--color-text-secondary);
  }
}

.card-view {
  display: flex;
  gap: 16px;

  .card-item {
    flex: 1;
    background: var(--color-bg-elevated);
    border-radius: 8px;
    overflow: hidden;
  }

  .card-item-cover {
    height: 100px;
    background: var(--color-primary-bg-hover);
  }

  .card-item-title {
    padding: 12px;
    font-weight: 500;
  }
}
</style>
