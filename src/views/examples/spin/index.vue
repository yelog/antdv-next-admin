<template>
  <div class="page-container">
    <div class="card mb-md">
      <h2 class="text-xl font-bold mb-sm">{{ $t('exampleSpin.title') }}</h2>
      <p class="text-secondary">{{ $t('exampleSpin.description') }}</p>
    </div>

    <a-row :gutter="[16, 16]">
      <!-- Basic -->
      <a-col :span="24" :lg="12">
        <a-card :title="$t('exampleSpin.basic')" :bordered="false">
          <a-flex align="center" gap="middle">
            <a-spin size="small" />
            <a-spin />
            <a-spin size="large" />
          </a-flex>
        </a-card>
      </a-col>

      <!-- Tip -->
      <a-col :span="24" :lg="12">
        <a-card :title="$t('exampleSpin.tip')" :bordered="false">
          <a-flex gap="middle">
            <a-spin :tip="$t('common.loading')" size="small">
              <div class="spin-placeholder" />
            </a-spin>
            <a-spin :tip="$t('common.loading')">
              <div class="spin-placeholder" />
            </a-spin>
            <a-spin :tip="$t('common.loading')" size="large">
              <div class="spin-placeholder" />
            </a-spin>
          </a-flex>
        </a-card>
      </a-col>

      <!-- Nested -->
      <a-col :span="24" :lg="12">
        <a-card :title="$t('exampleSpin.nested')" :bordered="false">
          <a-flex gap="middle" vertical>
            <a-spin :spinning="nestedLoading">
              <a-alert
                message="Alert message title"
                description="Further details about the context of this alert."
                type="info"
              />
            </a-spin>
            <a-flex align="center" gap="small">
              <span>{{ $t('exampleSpin.loadingState') }}</span>
              <a-switch v-model:checked="nestedLoading" />
            </a-flex>
          </a-flex>
        </a-card>
      </a-col>

      <!-- Delay -->
      <a-col :span="24" :lg="12">
        <a-card :title="$t('exampleSpin.delay')" :bordered="false">
          <template #extra>
            <a-tag color="blue">delay=500ms</a-tag>
          </template>
          <a-flex gap="middle" vertical>
            <a-spin :spinning="delayLoading" :delay="500">
              <a-alert
                message="Alert message title"
                description="Further details about the context of this alert."
                type="info"
              />
            </a-spin>
            <a-flex align="center" gap="small">
              <span>{{ $t('exampleSpin.loadingState') }}</span>
              <a-switch v-model:checked="delayLoading" />
            </a-flex>
          </a-flex>
        </a-card>
      </a-col>

      <!-- Custom Indicator -->
      <a-col :span="24" :lg="12">
        <a-card :title="$t('exampleSpin.customIndicator')" :bordered="false">
          <a-flex align="center" gap="middle">
            <a-spin size="small">
              <template #indicator>
                <LoadingOutlined spin />
              </template>
            </a-spin>
            <a-spin>
              <template #indicator>
                <LoadingOutlined spin />
              </template>
            </a-spin>
            <a-spin size="large">
              <template #indicator>
                <LoadingOutlined spin />
              </template>
            </a-spin>
            <a-spin>
              <template #indicator>
                <LoadingOutlined spin style="font-size: 48px" />
              </template>
            </a-spin>
          </a-flex>
        </a-card>
      </a-col>

      <!-- Percent / Progress -->
      <a-col :span="24" :lg="12">
        <a-card :title="$t('exampleSpin.percent')" :bordered="false">
          <a-flex align="center" gap="middle">
            <a-switch
              v-model:checked="autoPercent"
              checked-children="Auto"
              un-checked-children="Auto"
            />
            <a-spin :percent="mergedPercent" size="small" />
            <a-spin :percent="mergedPercent" />
            <a-spin :percent="mergedPercent" size="large" />
          </a-flex>
        </a-card>
      </a-col>

      <!-- Custom Styles -->
      <a-col :span="24" :lg="12">
        <a-card :title="$t('exampleSpin.customStyle')" :bordered="false">
          <a-flex align="center" gap="middle">
            <a-spin
              v-bind="sharedStyleProps"
              :styles="{ indicator: { color: '#00d4ff' } }"
            />
            <a-spin
              v-bind="sharedStyleProps"
              :styles="() => ({ indicator: { color: '#722ed1' } })"
              size="small"
            />
            <a-spin
              v-bind="sharedStyleProps"
              :styles="{ indicator: { color: '#52c41a' } }"
              size="large"
            />
          </a-flex>
        </a-card>
      </a-col>

      <!-- Fullscreen -->
      <a-col :span="24" :lg="12">
        <a-card :title="$t('exampleSpin.fullscreen')" :bordered="false">
          <a-button type="primary" @click="showFullscreen">
            {{ $t('exampleSpin.showFullscreen') }}
          </a-button>
          <a-spin :spinning="fullscreenSpinning" :percent="fullscreenPercent" fullscreen />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { LoadingOutlined } from '@antdv-next/icons'

// Nested loading
const nestedLoading = ref(false)

// Delay loading
const delayLoading = ref(false)

// Percent / Progress
const autoPercent = ref(false)
const percent = ref(-50)
let percentTimer: ReturnType<typeof setTimeout> | null = null

const mergedPercent = computed(() => autoPercent.value ? 'auto' : percent.value)

function updatePercent() {
  percentTimer = setTimeout(() => {
    const next = percent.value + 5
    percent.value = next > 150 ? -50 : next
  }, 100)
}

watch(percent, (_n, _o, onCleanup) => {
  updatePercent()
  onCleanup(() => {
    if (percentTimer) {
      clearTimeout(percentTimer)
      percentTimer = null
    }
  })
}, { immediate: true })

watch(autoPercent, () => {
  percent.value = -50
})

// Custom style shared props
const sharedStyleProps = {
  spinning: true,
  percent: 0,
}

// Fullscreen
const fullscreenSpinning = ref(false)
const fullscreenPercent = ref(0)

function showFullscreen() {
  fullscreenSpinning.value = true
  let ptg = -10
  const interval = setInterval(() => {
    ptg += 5
    fullscreenPercent.value = ptg
    if (ptg > 120) {
      clearInterval(interval)
      fullscreenSpinning.value = false
      fullscreenPercent.value = 0
    }
  }, 100)
}

onUnmounted(() => {
  if (percentTimer) {
    clearTimeout(percentTimer)
    percentTimer = null
  }
})
</script>

<style scoped lang="scss">
.page-container {
  overflow: hidden;
}

.mb-md {
  margin-bottom: var(--spacing-md);
}

.spin-placeholder {
  padding: 50px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}
</style>
