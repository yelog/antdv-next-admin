<template>
  <div class="page-container">
    <div class="card mb-lg">
      <h2>状态与缓存示例</h2>
      <p class="text-secondary">
        演示 Pinia 持久化（刷新恢复）和 keep-alive 页面局部缓存（切换不销毁）。
      </p>
    </div>

    <div class="card mb-lg">
      <div class="section-title">1. Pinia 持久化状态</div>

      <div class="form-grid">
        <div>
          <label>关键字</label>
          <a-input v-model:value="cacheStore.keyword" placeholder="输入后刷新页面仍保留" />
        </div>
        <div>
          <label>计数器</label>
          <div class="counter-row">
            <a-button size="small" @click="cacheStore.counter--">-1</a-button>
            <a-input-number v-model:value="cacheStore.counter" :min="-9999" :max="9999" />
            <a-button size="small" @click="cacheStore.counter++">+1</a-button>
          </div>
        </div>
        <div class="full-row">
          <label>备注</label>
          <a-textarea v-model:value="cacheStore.notes" :rows="3" placeholder="支持多行，自动持久化" />
        </div>
      </div>

      <a-space class="mt-md">
        <a-button @click="cacheStore.reset">重置状态</a-button>
        <a-button @click="pinCurrentTab">固定当前标签</a-button>
      </a-space>

      <div class="persist-tip">最近持久化时间：{{ cacheStore.updatedAt }}</div>
    </div>

    <div class="card">
      <div class="section-title">2. keep-alive 局部缓存</div>
      <a-radio-group v-model:value="activePanel" button-style="solid" class="mb-md">
        <a-radio-button value="panelA">面板 A</a-radio-button>
        <a-radio-button value="panelB">面板 B</a-radio-button>
      </a-radio-group>

      <keep-alive>
        <component :is="activeComponent" />
      </keep-alive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'antdv-next'
import { useTabsStore } from '@/stores/tabs'
import { useDemoStateCacheStore } from '@/stores/demoStateCache'

const cacheStore = useDemoStateCacheStore()
const tabsStore = useTabsStore()
const route = useRoute()

const activePanel = ref<'panelA' | 'panelB'>('panelA')

const PanelA = defineComponent({
  name: 'DemoCachePanelA',
  setup() {
    const localValue = ref('')
    const localCount = ref(0)

    return {
      localValue,
      localCount
    }
  },
  template: `
    <div class="cache-panel">
      <div class="panel-title">面板 A（切换面板后不会被销毁）</div>
      <a-input v-model:value="localValue" placeholder="输入内容，切换到 B 再切回仍保留" />
      <a-space>
        <a-button size="small" @click="localCount--">-</a-button>
        <span>局部计数：{{ localCount }}</span>
        <a-button size="small" @click="localCount++">+</a-button>
      </a-space>
    </div>
  `
})

const PanelB = defineComponent({
  name: 'DemoCachePanelB',
  setup() {
    const checked = ref(false)
    const text = ref('')

    return {
      checked,
      text
    }
  },
  template: `
    <div class="cache-panel">
      <div class="panel-title">面板 B（也会被 keep-alive 缓存）</div>
      <a-switch v-model:checked="checked" checked-children="ON" un-checked-children="OFF" />
      <a-textarea v-model:value="text" :rows="3" placeholder="输入内容后切换标签再回来仍保留" />
    </div>
  `
})

const activeComponent = computed(() => {
  return activePanel.value === 'panelA' ? PanelA : PanelB
})

const pinCurrentTab = () => {
  tabsStore.togglePinTab(route.path)
  message.success('已切换当前标签固定状态')
}
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}

.mb-md {
  margin-bottom: var(--spacing-md);
}

.mt-md {
  margin-top: var(--spacing-md);
}

.section-title {
  font-weight: var(--font-weight-semibold);
  margin-bottom: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  label {
    display: inline-block;
    margin-bottom: 6px;
    color: var(--color-text-secondary);
    font-size: 12px;
  }
}

.full-row {
  grid-column: 1 / -1;
}

.counter-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.persist-tip {
  margin-top: 10px;
  color: var(--color-text-tertiary);
  font-size: 12px;
}

.cache-panel {
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-title {
  font-weight: var(--font-weight-medium);
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
