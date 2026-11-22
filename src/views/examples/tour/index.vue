<template>
  <div class="page-container">
    <div class="card">
      <h2>{{ $t('exampleTour.title') }}</h2>
      <p class="mb-lg">{{ $t('exampleTour.description') }}</p>

      <a-space wrap :size="12">
        <a-button type="primary" @click="startBasicTour">
          {{ $t('exampleTour.startBasicTour') }}
        </a-button>
        <a-button @click="startCustomTour">
          {{ $t('exampleTour.startCustomTour') }}
        </a-button>
      </a-space>

      <a-divider />

      <div class="demo-area">
        <a-space :size="16">
          <a-button ref="btn1">
            <SearchOutlined /> {{ $t('exampleTour.searchButton') }}
          </a-button>
          <a-button ref="btn2">
            <PlusOutlined /> {{ $t('exampleTour.createButton') }}
          </a-button>
          <a-button ref="btn3">
            <SettingOutlined /> {{ $t('exampleTour.settingsButton') }}
          </a-button>
          <a-button ref="btn4">
            <ExportOutlined /> {{ $t('exampleTour.exportButton') }}
          </a-button>
        </a-space>
      </div>

      <a-divider />

      <div class="config-section">
        <h4>{{ $t('exampleTour.tourConfig') }}</h4>
        <div class="config-grid">
          <div class="config-item">
            <span>{{ $t('exampleTour.showMask') }}</span>
            <a-switch v-model:checked="tourConfig.mask" />
          </div>
          <div class="config-item">
            <span>{{ $t('exampleTour.showArrow') }}</span>
            <a-switch v-model:checked="tourConfig.arrow" />
          </div>
          <div class="config-item">
            <span>{{ $t('exampleTour.scrollIntoView') }}</span>
            <a-switch v-model:checked="tourConfig.scrollIntoView" />
          </div>
          <div class="config-item">
            <span>{{ $t('exampleTour.indicatorType') }}</span>
            <a-select v-model:value="tourConfig.type" :options="typeOptions" style="width: 120px" />
          </div>
        </div>
      </div>
    </div>

    <a-tour
      v-model:current="basicCurrent"
      :open="basicOpen"
      :steps="basicSteps"
      :mask="tourConfig.mask"
      :arrow="tourConfig.arrow"
      :type="tourConfig.type"
      @close="basicOpen = false"
    />

    <a-tour
      v-model:current="customCurrent"
      :open="customOpen"
      :steps="customSteps"
      :mask="tourConfig.mask"
      :arrow="tourConfig.arrow"
      :type="tourConfig.type"
      @close="customOpen = false"
    >
      <template #indicatorsRender="{ current, total }">
        <span class="custom-indicator">
          {{ current + 1 }} / {{ total }}
        </span>
      </template>
    </a-tour>
  </div>
</template>

<script setup lang="ts">
import {
  ExportOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@antdv-next/icons'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const typeOptions = [
  { value: 'default', label: 'default' },
  { value: 'primary', label: 'primary' },
]

const btn1 = ref()
const btn2 = ref()
const btn3 = ref()
const btn4 = ref()

const basicOpen = ref(false)
const basicCurrent = ref(0)

const customOpen = ref(false)
const customCurrent = ref(0)

const tourConfig = reactive({
  mask: true,
  arrow: true,
  scrollIntoView: true,
  type: 'default' as 'default' | 'primary',
})

const basicSteps = [
  {
    title: t('exampleTour.step1Title'),
    description: t('exampleTour.step1Desc'),
    target: () => btn1.value?.$el,
  },
  {
    title: t('exampleTour.step2Title'),
    description: t('exampleTour.step2Desc'),
    target: () => btn2.value?.$el,
  },
  {
    title: t('exampleTour.step3Title'),
    description: t('exampleTour.step3Desc'),
    target: () => btn3.value?.$el,
  },
  {
    title: t('exampleTour.step4Title'),
    description: t('exampleTour.step4Desc'),
    target: () => btn4.value?.$el,
  },
]

const customSteps = [
  {
    title: t('exampleTour.customStep1Title'),
    description: t('exampleTour.customStep1Desc'),
    target: () => btn1.value?.$el,
    placement: 'right' as const,
  },
  {
    title: t('exampleTour.customStep2Title'),
    description: t('exampleTour.customStep2Desc'),
    target: () => btn2.value?.$el,
    placement: 'bottom' as const,
  },
  {
    title: t('exampleTour.customStep3Title'),
    description: t('exampleTour.customStep3Desc'),
    target: () => btn3.value?.$el,
    placement: 'left' as const,
  },
  {
    title: t('exampleTour.customStep4Title'),
    description: t('exampleTour.customStep4Desc'),
    target: () => btn4.value?.$el,
    placement: 'top' as const,
  },
]

const startBasicTour = () => {
  basicCurrent.value = 0
  basicOpen.value = true
}

const startCustomTour = () => {
  customCurrent.value = 0
  customOpen.value = true
}
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}

.demo-area {
  padding: 24px;
  background: var(--color-bg-container);
  border-radius: 8px;
  border: 1px solid var(--color-border-secondary);
}

.config-section {
  h4 {
    margin-bottom: 16px;
    font-weight: 500;
  }
}

.config-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  background: var(--color-bg-container);
}

.custom-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 20px;
  padding: 0 8px;
  background: var(--color-primary);
  color: #fff;
  border-radius: 10px;
  font-size: 12px;
}
</style>
