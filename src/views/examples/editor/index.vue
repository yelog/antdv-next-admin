<template>
  <div class="page-container">
    <div class="card">
      <h2>{{ t('exampleEditor.title') }}</h2>
      <p class="text-secondary mb-lg">
        {{ t('exampleEditor.description') }}
      </p>

      <a-space direction="vertical" :size="16" style="width: 100%">
        <div>
          <h3>{{ t('exampleEditor.basicUsage') }}</h3>
          <Editor v-model="content1" :height="300" :placeholder="t('exampleEditor.placeholder')" />
        </div>

        <div>
          <h3>{{ t('exampleEditor.disabledState') }}</h3>
          <Editor v-model="content2" :height="200" disabled />
        </div>

        <div>
          <h3>{{ t('exampleEditor.customHeight') }}</h3>
          <Editor v-model="content3" :height="500" />
        </div>

        <div>
          <h3>{{ t('exampleEditor.contentPreview') }}</h3>
          <a-card :title="t('exampleEditor.htmlOutput')">
            <pre class="html-preview">{{ content1 || t('exampleEditor.noContent') }}</pre>
          </a-card>
        </div>

        <div>
          <a-space>
            <a-button type="primary" @click="handleSave">{{ t('exampleEditor.save') }}</a-button>
            <a-button @click="handleClear">{{ t('exampleEditor.clear') }}</a-button>
            <a-button @click="handleLoadDemo">{{ t('exampleEditor.loadDemo') }}</a-button>
          </a-space>
        </div>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'antdv-next'
import { useI18n } from 'vue-i18n'
import Editor from '@/components/Editor/index.vue'

const { t } = useI18n()

const content1 = ref('<p>This is a rich text editor example based on <strong>Tiptap</strong>.</p>')
const content2 = ref('<p>This editor is in disabled state and cannot be edited.</p>')
const content3 = ref('')

const handleSave = () => {
  console.log('Saved content:', content1.value)
  message.success(t('exampleEditor.savedMessage'))
}

const handleClear = () => {
  content1.value = ''
  message.info(t('exampleEditor.clearedMessage'))
}

const handleLoadDemo = () => {
  content1.value = `
    <h1>Welcome to Tiptap Editor</h1>
    <p>This is a powerful rich text editor with the following features:</p>
    <h2>Text Formatting</h2>
    <ul>
      <li><strong>Bold text</strong></li>
      <li><em>Italic text</em></li>
      <li><s>Strikethrough text</s></li>
      <li><code>Inline code</code></li>
    </ul>
    <h2>Lists</h2>
    <ol>
      <li>Ordered list item 1</li>
      <li>Ordered list item 2</li>
      <li>Ordered list item 3</li>
    </ol>
    <h2>Blockquote</h2>
    <blockquote>
      <p>This is a blockquote, useful for highlighting important content.</p>
    </blockquote>
    <h2>Code Block</h2>
    <pre><code>function hello() {
  console.log('Hello, Tiptap!')
}</code></pre>
    <h2>Links</h2>
    <p>Visit the <a href="https://tiptap.dev" target="_blank" rel="noopener noreferrer">Tiptap website</a> for more information.</p>
  `
  message.success(t('exampleEditor.demoLoadedMessage'))
}
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}

h3 {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
}

.html-preview {
  max-height: 300px;
  overflow-y: auto;
  background: var(--color-bg-layout);
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
