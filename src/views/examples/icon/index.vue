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

      <div class="render-grid">
        <article
          v-for="mode in renderModes"
          :key="mode.icon"
          class="mode-card"
          :style="{
            '--mode-color': mode.color,
            '--mode-card-bg': mode.bg,
            '--mode-card-border': mode.border
          }"
        >
          <div class="mode-head">
            <a-tag :color="mode.color">{{ mode.tag }}</a-tag>
          </div>
          <div class="mode-preview">
            <IconView :icon="mode.icon" :size="44" />
          </div>
          <div class="mode-info">
            <div class="mode-label">{{ mode.label }}</div>
            <code class="mode-code">{{ mode.icon }}</code>
          </div>
        </article>
      </div>
    </section>

    <section class="card picker-card">
      <div class="section-head">
        <h3>{{ $t('exampleIcon.pickerTitle') }}</h3>
        <p>{{ $t('exampleIcon.pickerSubtitle') }}</p>
      </div>

      <div class="picker-layout">
        <div class="picker-input-panel">
          <IconPicker
            v-model="pickedIcon"
            :svg-icons="[svgSymbolName]"
            :placeholder="$t('exampleIcon.modelLabel')"
            :online-limit="160"
          />
        </div>

        <div class="preview-panel">
          <div class="preview-icon-wrap">
            <IconView :icon="activeIcon" :size="58" />
          </div>

          <div class="preview-field">
            <label>{{ $t('exampleIcon.modelLabel') }}</label>
            <a-input :value="activeIcon" readonly />
          </div>

          <div class="preview-field">
            <label>{{ $t('exampleIcon.previewLabel') }}</label>
            <div class="preview-inline">
              <IconView :icon="activeIcon" :size="22" />
              <span>{{ activeIcon }}</span>
            </div>
          </div>

          <a-space :size="12" wrap>
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

const svgSymbolName = 'icon-demo-orbit'
const defaultIcon = 'ri:compass-3-line'
const pickedIcon = ref(defaultIcon)

const activeIcon = computed(() => pickedIcon.value || defaultIcon)

const renderModes = computed(() => [
  {
    label: $t('exampleIcon.modeSvg'),
    tag: 'svg',
    icon: `svg:${svgSymbolName}`,
    color: '#f59e0b',
    border: '#fde7bd',
    bg: 'linear-gradient(160deg, #fff6e5 0%, #fff 62%)'
  },
  {
    label: $t('exampleIcon.modeAntdv'),
    tag: 'antdv-next',
    icon: 'antdv-next:SafetyOutlined',
    color: '#1677ff',
    border: '#d5e5ff',
    bg: 'linear-gradient(160deg, #eaf2ff 0%, #fff 62%)'
  },
  {
    label: $t('exampleIcon.modeIconify'),
    tag: 'iconify',
    icon: 'ri:compass-3-line',
    color: '#10b981',
    border: '#c8f2e3',
    bg: 'linear-gradient(160deg, #e9fbf4 0%, #fff 62%)'
  }
])

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
  margin-bottom: var(--spacing-sm);
}

.intro-title {
  margin-bottom: 6px;
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
  margin-bottom: var(--spacing-md);

  h3 {
    margin: 0 0 6px;
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

.render-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: var(--spacing-md);
}

.mode-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  transition: transform var(--duration-base) var(--ease-out), box-shadow var(--duration-base) var(--ease-out);
  border: 1px solid var(--mode-card-border);
  border-radius: 12px;
  background: var(--mode-card-bg);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
}

.mode-head {
  display: flex;
  justify-content: flex-end;
}

.mode-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.68);
  color: var(--mode-color);
}

.mode-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mode-label {
  color: var(--color-text-primary);
  font-weight: 600;
}

.mode-code {
  overflow: hidden;
  color: var(--color-text-secondary);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.picker-layout {
  display: grid;
  grid-template-columns: minmax(280px, 420px) minmax(320px, 1fr);
  gap: var(--spacing-md);
  align-items: start;
}

.picker-input-panel {
  padding: 4px;
}

.preview-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  background: var(--color-bg-layout);
}

.preview-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 14px;
  background: var(--color-bg-container);
  color: var(--color-primary);
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

@media (max-width: 992px) {
  .picker-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .intro-title {
    font-size: 20px;
  }

  .render-grid {
    grid-template-columns: 1fr;
  }
}
</style>
