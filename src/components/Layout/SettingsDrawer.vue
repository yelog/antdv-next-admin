<template>
  <a-drawer
    v-model:open="visible"
    :title="$t('settings.title')"
    placement="right"
    :size="320"
  >
    <div class="settings-drawer">
      <!-- Theme Color -->
      <div class="settings-section">
        <h4>{{ $t('settings.themeColor') }}</h4>
        <div class="color-picker">
          <div
            v-for="color in PRESET_COLORS"
            :key="color.value"
            :class="['color-item', { active: settingsStore.primaryColor === color.value }]"
            :style="{ backgroundColor: color.hex }"
            @click="settingsStore.setPrimaryColor(color.value)"
          >
            <CheckOutlined v-if="settingsStore.primaryColor === color.value" />
          </div>
        </div>
      </div>

      <!-- Sidebar Theme -->
      <div class="settings-section">
        <h4>{{ $t('settings.sidebarTheme') }}</h4>
        <a-radio-group
          v-model:value="settingsStore.sidebarTheme"
          @change="handleSidebarThemeChange"
        >
          <a-radio value="light">{{ $t('settings.light') }}</a-radio>
          <a-radio value="dark">{{ $t('settings.dark') }}</a-radio>
        </a-radio-group>
      </div>

      <!-- Layout Mode -->
      <div class="settings-section">
        <h4>{{ $t('settings.layoutMode') }}</h4>
        <a-radio-group
          v-model:value="settingsStore.layoutMode"
          @change="handleLayoutModeChange"
        >
          <a-radio value="vertical">{{ $t('settings.vertical') }}</a-radio>
          <a-radio value="horizontal">{{ $t('settings.horizontal') }}</a-radio>
        </a-radio-group>
      </div>

      <!-- Page Animation -->
      <div class="settings-section">
        <h4>{{ $t('settings.pageAnimation') }}</h4>
        <a-select
          v-model:value="settingsStore.pageAnimation"
          :options="pageAnimationOptions"
          style="width: 100%"
          @change="handlePageAnimationChange"
        />
      </div>

      <!-- Gray Mode -->
      <div class="settings-section">
        <h4>{{ $t('settings.grayMode') }}</h4>
        <a-switch
          v-model:checked="settingsStore.grayMode"
          @change="handleGrayModeChange"
        />
        <div class="hint">{{ $t('settings.grayModeHint') }}</div>
      </div>

      <!-- Actions -->
      <div class="settings-actions">
        <a-button type="primary" block @click="visible = false">
          {{ $t('common.confirm') }}
        </a-button>
        <a-button block @click="handleReset" style="margin-top: 8px">
          {{ $t('settings.reset') }}
        </a-button>
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckOutlined } from '@antdv-next/icons'
import { useSettingsStore } from '@/stores/settings'
import { Modal } from 'antdv-next'
import { $t } from '@/locales'
import type { PageAnimation, PrimaryColor } from '@/types/layout'

const visible = ref(false)
const settingsStore = useSettingsStore()

const PRESET_COLORS: Array<{ value: PrimaryColor; hex: string }> = [
  { value: 'blue', hex: '#1890ff' },
  { value: 'green', hex: '#52c41a' },
  { value: 'purple', hex: '#722ed1' },
  { value: 'red', hex: '#f5222d' },
  { value: 'orange', hex: '#fa8c16' },
  { value: 'cyan', hex: '#13c2c2' }
]

const pageAnimationOptions = computed(() => [
  { label: $t('settings.fade'), value: 'fade' },
  { label: $t('settings.slideLeft'), value: 'slide-left' },
  { label: $t('settings.slideRight'), value: 'slide-right' },
  { label: $t('settings.slideUp'), value: 'slide-up' },
  { label: $t('settings.slideDown'), value: 'slide-down' },
  { label: $t('settings.zoom'), value: 'zoom' },
  { label: $t('settings.zoomBig'), value: 'zoom-big' },
  { label: $t('settings.none'), value: 'none' }
])

const handleSidebarThemeChange = (e: any) => {
  settingsStore.setSidebarTheme(e.target.value)
}

const handleLayoutModeChange = (e: any) => {
  settingsStore.setLayoutMode(e.target.value)
}

const handlePageAnimationChange = (value: PageAnimation) => {
  settingsStore.setPageAnimation(value)
}

const handleGrayModeChange = (checked: boolean) => {
  settingsStore.setGrayMode(checked)
}

const handleReset = () => {
  Modal.confirm({
    title: $t('settings.confirmReset'),
    onOk: () => {
      settingsStore.resetSettings()
    }
  })
}

const open = () => {
  visible.value = true
}

const close = () => {
  visible.value = false
}

defineExpose({ open, close })
</script>

<style scoped lang="scss">
.settings-drawer {
  .settings-section {
    margin-bottom: var(--spacing-lg);

    h4 {
      margin-bottom: var(--spacing-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
    }

    .color-picker {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-sm);

      .color-item {
        width: 100%;
        aspect-ratio: 1;
        border-radius: var(--radius-base);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--duration-slow) var(--ease-out);
        border: 2px solid transparent;

        &:hover {
          transform: scale(1.1);
        }

        &.active {
          border-color: #fff;
          box-shadow: 0 0 0 2px var(--color-primary);
        }

        .anticon {
          color: #fff;
          font-size: 20px;
        }
      }
    }

    .hint {
      margin-top: var(--spacing-xs);
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
    }
  }

  .settings-actions {
    margin-top: var(--spacing-xl);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-border-secondary);
  }
}
</style>
