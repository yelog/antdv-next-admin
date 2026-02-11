<template>
  <div class="page-container">
    <div class="card">
      <h2>{{ $t('exampleWatermark.title') }}</h2>
      <p class="mb-lg">{{ $t('exampleWatermark.description') }}</p>

      <a-form layout="vertical" :style="{ maxWidth: '600px' }">
        <a-form-item :label="$t('exampleWatermark.enableGlobal')">
          <a-switch
            :checked="watermarkStore.enabled"
            @change="(val: boolean) => watermarkStore.setEnabled(val)"
          />
        </a-form-item>

        <a-form-item :label="$t('exampleWatermark.content')">
          <a-input
            :value="watermarkStore.content"
            @update:value="(val: string) => watermarkStore.setContent(val)"
          />
        </a-form-item>

        <a-form-item :label="$t('exampleWatermark.fontSize')">
          <a-input-number
            :value="watermarkStore.fontSize"
            :min="12"
            :max="48"
            @change="(val: number) => watermarkStore.setFontSize(val)"
          />
        </a-form-item>

        <a-form-item :label="$t('exampleWatermark.rotate')">
          <a-slider
            :value="watermarkStore.rotate"
            :min="-180"
            :max="180"
            @change="(val: number) => watermarkStore.setRotate(val)"
          />
        </a-form-item>

        <a-form-item :label="$t('exampleWatermark.opacity')">
          <a-slider
            :value="watermarkStore.opacity"
            :min="0"
            :max="1"
            :step="0.01"
            @change="(val: number) => watermarkStore.setOpacity(val)"
          />
        </a-form-item>

        <a-form-item :label="$t('exampleWatermark.gapX')">
          <a-input-number
            :value="watermarkStore.gap[0]"
            :min="10"
            :max="500"
            @change="(val: number) => watermarkStore.setGap([val, watermarkStore.gap[1]])"
          />
        </a-form-item>

        <a-form-item :label="$t('exampleWatermark.gapY')">
          <a-input-number
            :value="watermarkStore.gap[1]"
            :min="10"
            :max="500"
            @change="(val: number) => watermarkStore.setGap([watermarkStore.gap[0], val])"
          />
        </a-form-item>
      </a-form>
    </div>

    <div class="card preview-card">
      <h3>{{ $t('exampleWatermark.preview') }}</h3>
      <a-watermark v-bind="previewProps" class="preview-area">
        <div class="preview-content">
          <p>{{ $t('exampleWatermark.previewText') }}</p>
        </div>
      </a-watermark>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWatermarkStore } from '@/stores/watermark'

const watermarkStore = useWatermarkStore()

const previewProps = computed(() => ({
  content: watermarkStore.content,
  gap: watermarkStore.gap,
  rotate: watermarkStore.rotate,
  font: {
    fontSize: watermarkStore.fontSize
  },
  style: {
    opacity: watermarkStore.opacity
  }
}))
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}

.preview-card {
  margin-top: var(--spacing-lg);
}

.preview-area {
  min-height: 300px;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.preview-content {
  padding: var(--spacing-xl);
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-lg);
}
</style>
