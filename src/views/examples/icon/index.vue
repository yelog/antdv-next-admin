<template>
  <div class="page-container icon-demo-page">
    <svg class="sprite-defs" aria-hidden="true">
      <symbol id="icon-demo-orbit" viewBox="0 0 1024 1024">
        <circle cx="512" cy="512" r="332" fill="none" stroke="currentColor" stroke-width="72" />
        <circle cx="512" cy="512" r="90" fill="currentColor" opacity="0.88" />
        <path
          d="M260 378c112-90 392-90 504 0"
          fill="none"
          stroke="currentColor"
          stroke-width="58"
          stroke-linecap="round"
        />
      </symbol>

      <symbol id="icon-demo-pulse" viewBox="0 0 1024 1024">
        <rect x="176" y="176" width="672" height="672" rx="156" fill="none" stroke="currentColor" stroke-width="68" />
        <path
          d="M224 552h160l90-188 96 292 76-148h152"
          fill="none"
          stroke="currentColor"
          stroke-width="62"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </symbol>

      <symbol id="icon-demo-spark" viewBox="0 0 1024 1024">
        <path
          d="M520 120l84 198 212 24-160 136 48 206-184-108-182 108 48-206-160-136 212-24z"
          fill="currentColor"
          opacity="0.88"
        />
      </symbol>
    </svg>

    <section class="card intro-card">
      <div class="intro-main">
        <h2 class="intro-title">{{ $t('exampleIcon.title') }}</h2>
        <p class="intro-subtitle">{{ $t('exampleIcon.subtitle') }}</p>
      </div>
      <p class="intro-capability">{{ $t('exampleIcon.capabilities') }}</p>
    </section>

    <section class="card">
      <div class="section-head">
        <h3>{{ $t('exampleIcon.renderTitle') }}</h3>
        <p>{{ $t('exampleIcon.renderSubtitle') }}</p>
      </div>

      <div class="sample-hint">
        <a-tag color="blue">{{ $t('exampleIcon.sampleHint') }}</a-tag>
      </div>

      <div class="samples-layout">
        <article
          v-for="group in showcaseGroups"
          :key="group.key"
          class="group-card"
          :style="{ '--group-color': group.color }"
        >
          <div class="group-head">
            <div class="group-title">{{ group.label }}</div>
            <a-tag :color="group.color">{{ group.tag }}</a-tag>
          </div>

          <div class="mini-grid">
            <button
              v-for="item in group.items"
              :key="item.icon"
              type="button"
              class="mini-item"
              :class="{ active: activeIcon === item.icon }"
              @click="applyExampleIcon(item.icon)"
            >
              <IconView :icon="item.icon" :size="18" />
              <span>{{ item.name }}</span>
            </button>
          </div>
        </article>
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <h3>{{ $t('exampleIcon.guidesTitle') }}</h3>
        <p>{{ $t('exampleIcon.guidesSubtitle') }}</p>
      </div>

      <div class="guide-grid">
        <article class="guide-card">
          <h4>{{ $t('exampleIcon.svgGuideTitle') }}</h4>
          <ol>
            <li>{{ $t('exampleIcon.guideStepSvg1') }}</li>
            <li>{{ $t('exampleIcon.guideStepSvg2') }}</li>
            <li>{{ $t('exampleIcon.guideStepSvg3') }}</li>
          </ol>
          <pre><code>{{ svgGuideCode }}</code></pre>
        </article>

        <article class="guide-card">
          <h4>{{ $t('exampleIcon.iconifyGuideTitle') }}</h4>
          <ol>
            <li>{{ $t('exampleIcon.guideStepIconify1') }}</li>
            <li>{{ $t('exampleIcon.guideStepIconify2') }}</li>
            <li>{{ $t('exampleIcon.guideStepIconify3') }}</li>
          </ol>
          <pre><code>{{ iconifyGuideCode }}</code></pre>
        </article>
      </div>
    </section>

    <section class="card picker-card">
      <div class="section-head">
        <h3>{{ $t('exampleIcon.pickerTitle') }}</h3>
        <p>{{ $t('exampleIcon.pickerSubtitle') }}</p>
      </div>

      <div class="picker-shell">
        <div class="picker-toolbar">
          <div class="picker-input-wrap">
            <IconPicker
              v-model="pickedIcon"
              :svg-icons="svgSymbolNames"
              :placeholder="$t('exampleIcon.modelLabel')"
              :online-limit="160"
            />
          </div>

          <a-space :size="10" wrap>
            <a-button type="primary" @click="copyIconValue">
              <CopyOutlined />
              {{ $t('exampleIcon.copy') }}
            </a-button>
            <a-button @click="resetIconValue">
              <ReloadOutlined />
              {{ $t('exampleIcon.reset') }}
            </a-button>
          </a-space>
        </div>

        <div class="picker-body">
          <div class="hero-panel">
            <div class="hero-icon-wrap">
              <IconView :icon="activeIcon" :size="64" />
            </div>

            <div class="hero-info">
              <div class="hero-value">{{ activeIcon }}</div>
              <a-space :size="8" wrap>
                <a-tag color="blue">{{ $t('exampleIcon.sourceLabel') }}</a-tag>
                <a-tag>{{ activeSourceText }}</a-tag>
              </a-space>
            </div>
          </div>

          <div class="preview-fields">
            <div class="preview-field">
              <label>{{ $t('exampleIcon.modelLabel') }}</label>
              <a-input :value="activeIcon" readonly />
            </div>

            <div class="preview-field">
              <label>{{ $t('exampleIcon.previewLabel') }}</label>
              <div class="preview-inline">
                <IconView :icon="activeIcon" :size="20" />
                <span>{{ activeIcon }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CopyOutlined, ReloadOutlined } from '@antdv-next/icons'
import { message } from 'antdv-next'
import { $t } from '@/locales'
import IconView from '@/components/Icon/index.vue'
import IconPicker from '@/components/IconPicker/index.vue'

const svgOrbitId = 'icon-demo-orbit'
const svgPulseId = 'icon-demo-pulse'
const svgSparkId = 'icon-demo-spark'
const svgSymbolNames = [svgOrbitId, svgPulseId, svgSparkId]

const defaultIcon = 'ri:map-pin-time-line'
const pickedIcon = ref(defaultIcon)

const activeIcon = computed(() => pickedIcon.value || defaultIcon)

const activeSourceText = computed(() => {
  const value = activeIcon.value.trim()
  if (value.startsWith('svg:')) return $t('exampleIcon.sourceSvg')
  if (value.startsWith('antdv-next:') || value.startsWith('antd:')) return $t('exampleIcon.sourceAntdv')
  if (value.startsWith('ri:') || value.startsWith('mdi:') || value.startsWith('ion:')) {
    return $t('exampleIcon.sourceIconify')
  }
  if (value.includes(':')) return $t('exampleIcon.sourceOnline')
  return $t('exampleIcon.sourceUnknown')
})

const showcaseGroups = computed(() => [
  {
    key: 'svg',
    label: $t('exampleIcon.modeSvg'),
    tag: 'svg',
    color: '#f59e0b',
    items: [
      { icon: `svg:${svgOrbitId}`, name: 'orbit' },
      { icon: `svg:${svgPulseId}`, name: 'pulse' },
      { icon: `svg:${svgSparkId}`, name: 'spark' }
    ]
  },
  {
    key: 'antdv',
    label: $t('exampleIcon.modeAntdv'),
    tag: 'antdv-next',
    color: '#1677ff',
    items: [
      { icon: 'antdv-next:HomeOutlined', name: 'HomeOutlined' },
      { icon: 'antdv-next:AppstoreOutlined', name: 'AppstoreOutlined' },
      { icon: 'antdv-next:SettingOutlined', name: 'SettingOutlined' },
      { icon: 'antdv-next:BellOutlined', name: 'BellOutlined' },
      { icon: 'antdv-next:SafetyOutlined', name: 'SafetyOutlined' }
    ]
  },
  {
    key: 'iconify',
    label: $t('exampleIcon.modeIconify'),
    tag: 'iconify',
    color: '#10b981',
    items: [
      { icon: 'ri:map-pin-time-line', name: 'ri:map-pin-time-line' },
      { icon: 'ri:compass-3-line', name: 'ri:compass-3-line' },
      { icon: 'mdi:account-circle-outline', name: 'mdi:account-circle-outline' },
      { icon: 'mdi:email-outline', name: 'mdi:email-outline' },
      { icon: 'ion:planet-outline', name: 'ion:planet-outline' }
    ]
  }
])

const svgGuideCode = `<svg aria-hidden="true" style="position:absolute;width:0;height:0">
  <symbol id="icon-demo-orbit" viewBox="0 0 1024 1024">...</symbol>
</svg>

<IconView icon="svg:icon-demo-orbit" :size="20" />`

const iconifyGuideCode = `<IconView icon="ri:home-line" :size="20" />
<IconView icon="mdi:account-circle-outline" :size="20" />

<IconPicker v-model="iconValue" />`

const applyExampleIcon = (icon: string) => {
  pickedIcon.value = icon
}

const copyFallback = (value: string) => {
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

const copyIconValue = async () => {
  const value = activeIcon.value.trim()
  if (!value) {
    message.warning($t('exampleIcon.copyEmpty'))
    return
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
    } else {
      copyFallback(value)
    }
    message.success($t('exampleIcon.copySuccess'))
  } catch (error) {
    try {
      copyFallback(value)
      message.success($t('exampleIcon.copySuccess'))
    } catch {
      message.error($t('exampleIcon.copyFailed'))
    }
  }
}

const resetIconValue = () => {
  pickedIcon.value = defaultIcon
}
</script>

<style scoped lang="scss">
.icon-demo-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);

  > .card {
    flex-shrink: 0;
  }
}

.sprite-defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

.intro-card {
  position: relative;
  overflow: hidden;
  border-color: rgba(22, 119, 255, 0.16);
  background:
    radial-gradient(circle at 14% -20%, rgba(22, 119, 255, 0.2), transparent 44%),
    radial-gradient(circle at 100% 120%, rgba(245, 158, 11, 0.22), transparent 30%),
    var(--color-bg-container);
}

.intro-main {
  margin-bottom: 6px;
}

.intro-title {
  margin: 0 0 4px;
  color: var(--color-text-primary);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.intro-subtitle {
  margin: 0;
  color: var(--color-text-secondary);
}

.intro-capability {
  margin: 0;
  color: #2158b6;
  font-size: 13px;
  font-weight: 500;
}

.section-head {
  margin-bottom: 12px;

  h3 {
    margin: 0 0 4px;
    color: var(--color-text-primary);
    font-size: 18px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 13px;
  }
}

.sample-hint {
  margin-bottom: 10px;
}

.samples-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.group-card {
  border: 1px solid color-mix(in srgb, var(--group-color), #e9edf3 72%);
  border-radius: 12px;
  background: linear-gradient(160deg, color-mix(in srgb, var(--group-color), #fff 90%) 0%, #fff 55%);
  padding: 12px;
}

.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.group-title {
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 600;
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(98px, 1fr));
  gap: 8px;
}

.mini-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 58px;
  margin: 0;
  padding: 6px;
  transition: all var(--duration-base) var(--ease-out);
  border: 1px solid #e6eaf0;
  border-radius: 8px;
  background: #fff;
  color: var(--color-text-secondary);
  cursor: pointer;

  span {
    overflow: hidden;
    max-width: 100%;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    transform: translateY(-1px);
    border-color: var(--group-color);
    color: var(--group-color);
  }

  &.active {
    border-color: var(--group-color);
    background: color-mix(in srgb, var(--group-color), #fff 89%);
    color: var(--group-color);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--group-color), #fff 55%);
  }
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px;
}

.guide-card {
  padding: 14px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  background: #fff;

  h4 {
    margin: 0 0 8px;
    color: var(--color-text-primary);
    font-size: 15px;
    font-weight: 700;
  }

  ol {
    margin: 0 0 10px;
    padding-left: 18px;
    color: var(--color-text-secondary);
    font-size: 13px;
  }

  li + li {
    margin-top: 4px;
  }

  pre {
    margin: 0;
    padding: 10px;
    overflow: auto;
    border: 1px solid #edf0f5;
    border-radius: 8px;
    background: #f7f9fc;
    color: #334155;
    font-size: 12px;
    line-height: 1.45;
  }
}

.picker-shell {
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  background: var(--color-bg-layout);
  padding: 14px;
}

.picker-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.picker-input-wrap {
  flex: 1;
  min-width: 220px;
}

.picker-input-wrap :deep(.ip-input-trigger) {
  width: 100%;
}

.picker-body {
  display: grid;
  grid-template-columns: minmax(250px, 320px) minmax(300px, 1fr);
  gap: 12px;
  align-items: stretch;
}

.hero-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  padding: 14px;
  border: 1px solid #dde4ee;
  border-radius: 10px;
  background: #fff;
}

.hero-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 94px;
  height: 94px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 14px;
  background: var(--color-bg-container);
  color: var(--color-primary);
}

.hero-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hero-value {
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid #dde4ee;
  border-radius: 10px;
  background: #fff;
}

.preview-field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    color: var(--color-text-secondary);
    font-size: 12px;
    font-weight: 500;
  }
}

.preview-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 8px 10px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  background: var(--color-bg-container);
  color: var(--color-text-primary);
  font-size: 13px;
}

@media (max-width: 1080px) {
  .picker-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .picker-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .intro-title {
    font-size: 20px;
  }

  .guide-grid {
    grid-template-columns: 1fr;
  }
}
</style>
