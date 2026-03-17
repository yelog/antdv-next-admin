<template>
  <div class="page-container">
    <div class="card">
      <h2>{{ $t('exampleSplitter.title') }}</h2>
      <p class="mb-lg">{{ $t('exampleSplitter.description') }}</p>

      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="basic" :tab="$t('exampleSplitter.basicTab')">
          <div class="splitter-demo">
            <h4>{{ $t('exampleSplitter.horizontalSplit') }}</h4>
            <a-splitter :style="{ height: '200px', border: '1px solid var(--color-border)' }">
              <a-splitter-panel>
                <div class="panel-content panel-left">
                  {{ $t('exampleSplitter.leftPanel') }}
                </div>
              </a-splitter-panel>
              <a-splitter-panel>
                <div class="panel-content panel-right">
                  {{ $t('exampleSplitter.rightPanel') }}
                </div>
              </a-splitter-panel>
            </a-splitter>

            <h4 style="margin-top: 24px">{{ $t('exampleSplitter.verticalSplit') }}</h4>
            <a-splitter :style="{ height: '200px', border: '1px solid var(--color-border)' }" layout="vertical">
              <a-splitter-panel>
                <div class="panel-content panel-top">
                  {{ $t('exampleSplitter.topPanel') }}
                </div>
              </a-splitter-panel>
              <a-splitter-panel>
                <div class="panel-content panel-bottom">
                  {{ $t('exampleSplitter.bottomPanel') }}
                </div>
              </a-splitter-panel>
            </a-splitter>
          </div>
        </a-tab-pane>

        <a-tab-pane key="nested" :tab="$t('exampleSplitter.nestedTab')">
          <div class="splitter-demo">
            <h4>{{ $t('exampleSplitter.threeColumnLayout') }}</h4>
            <a-splitter :style="{ height: '300px', border: '1px solid var(--color-border)' }">
              <a-splitter-panel :size="200" :min="100" :max="300">
                <div class="panel-content panel-sidebar">
                  {{ $t('exampleSplitter.sidebarPanel') }}
                </div>
              </a-splitter-panel>
              <a-splitter-panel>
                <a-splitter layout="vertical">
                  <a-splitter-panel>
                    <div class="panel-content panel-main">
                      {{ $t('exampleSplitter.mainContent') }}
                    </div>
                  </a-splitter-panel>
                  <a-splitter-panel :size="100">
                    <div class="panel-content panel-footer">
                      {{ $t('exampleSplitter.footerPanel') }}
                    </div>
                  </a-splitter-panel>
                </a-splitter>
              </a-splitter-panel>
              <a-splitter-panel :size="200" :min="150">
                <div class="panel-content panel-aside">
                  {{ $t('exampleSplitter.asidePanel') }}
                </div>
              </a-splitter-panel>
            </a-splitter>
          </div>
        </a-tab-pane>

        <a-tab-pane key="config" :tab="$t('exampleSplitter.configTab')">
          <div class="config-section">
            <div class="config-controls">
              <div class="config-item">
                <span>{{ $t('exampleSplitter.minSize') }}</span>
                <a-input-number v-model:value="configMinSize" :min="50" :max="300" />
              </div>
              <div class="config-item">
                <span>{{ $t('exampleSplitter.maxSize') }}</span>
                <a-input-number v-model:value="configMaxSize" :min="100" :max="500" />
              </div>
              <div class="config-item">
                <span>{{ $t('exampleSplitter.defaultSize') }}</span>
                <a-input-number v-model:value="configDefaultSize" :min="100" :max="400" />
              </div>
              <div class="config-item">
                <span>{{ $t('exampleSplitter.resizable') }}</span>
                <a-switch v-model:checked="configResizable" />
              </div>
            </div>
            <a-splitter :style="{ height: '200px', border: '1px solid var(--color-border)' }">
              <a-splitter-panel
                :size="configDefaultSize"
                :min="configMinSize"
                :max="configMaxSize"
                :resizable="configResizable"
              >
                <div class="panel-content panel-config">
                  {{ $t('exampleSplitter.configurablePanel') }}
                  <div class="config-info">
                    min: {{ configMinSize }}px | max: {{ configMaxSize }}px
                  </div>
                </div>
              </a-splitter-panel>
              <a-splitter-panel>
                <div class="panel-content panel-auto">
                  {{ $t('exampleSplitter.autoPanel') }}
                </div>
              </a-splitter-panel>
            </a-splitter>
          </div>
        </a-tab-pane>

        <a-tab-pane key="business" :tab="$t('exampleSplitter.businessTab')">
          <div class="splitter-demo">
            <h4>{{ $t('exampleSplitter.codeEditorLayout') }}</h4>
            <a-splitter :style="{ height: '350px', border: '1px solid var(--color-border)' }">
              <a-splitter-panel :size="220" :min="180">
                <div class="panel-content panel-file-tree">
                  <div class="file-tree">
                    <div class="file-item folder">
                      <FolderOutlined /> src
                    </div>
                    <div class="file-item">
                      <FileOutlined /> main.ts
                    </div>
                    <div class="file-item">
                      <FileOutlined /> App.vue
                    </div>
                    <div class="file-item folder">
                      <FolderOutlined /> components
                    </div>
                    <div class="file-item">
                      <FileOutlined /> Header.vue
                    </div>
                    <div class="file-item">
                      <FileOutlined /> Footer.vue
                    </div>
                  </div>
                </div>
              </a-splitter-panel>
              <a-splitter-panel>
                <a-splitter layout="vertical">
                  <a-splitter-panel>
                    <div class="panel-content panel-code">
                      <pre class="code-preview"><code>import {{ '{' }} createApp {{ '}' }} from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')</code></pre>
                    </div>
                  </a-splitter-panel>
                  <a-splitter-panel :size="100">
                    <div class="panel-content panel-terminal">
                      <span class="terminal-prompt">$</span> npm run dev
                    </div>
                  </a-splitter-panel>
                </a-splitter>
              </a-splitter-panel>
            </a-splitter>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileOutlined, FolderOutlined } from '@antdv-next/icons'
import { ref } from 'vue'

const activeTab = ref('basic')
const configMinSize = ref(100)
const configMaxSize = ref(400)
const configDefaultSize = ref(200)
const configResizable = ref(true)
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}

.splitter-demo {
  h4 {
    margin-bottom: 12px;
    font-weight: 500;
  }
}

.panel-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-container);
  color: var(--color-text-secondary);
  font-size: 14px;
}

.panel-left {
  background: var(--color-primary-bg-hover);
}

.panel-right {
  background: var(--color-success-bg-hover);
}

.panel-top {
  background: var(--color-warning-bg-hover);
}

.panel-bottom {
  background: var(--color-info-bg-hover);
}

.panel-sidebar {
  background: var(--color-bg-elevated);
}

.panel-main {
  background: var(--color-bg-container);
}

.panel-footer {
  background: var(--color-bg-spotlight);
}

.panel-aside {
  background: var(--color-bg-elevated);
}

.panel-config {
  background: var(--color-primary-bg-hover);
}

.panel-auto {
  background: var(--color-bg-container);
}

.panel-file-tree {
  background: var(--color-bg-elevated);
  padding: 12px;
  align-items: flex-start;
  justify-content: flex-start;
}

.file-tree {
  width: 100%;
}

.file-item {
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:hover {
    background: var(--color-bg-container);
  }

  &.folder {
    font-weight: 500;
  }
}

.panel-code {
  background: #1e1e1e;
  padding: 16px;
  align-items: flex-start;
  justify-content: flex-start;
}

.code-preview {
  margin: 0;
  color: #d4d4d4;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.panel-terminal {
  background: #1e1e1e;
  padding: 12px;
  align-items: flex-start;
  justify-content: flex-start;
  color: #4ec9b0;
  font-family: 'Fira Code', monospace;
}

.terminal-prompt {
  color: #4ec9b0;
  margin-right: 8px;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.config-controls {
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

.config-info {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}
</style>