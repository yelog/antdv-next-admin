<template>
  <div class="page-container">
    <div class="card">
      <h2>富文本编辑器示例</h2>
      <p class="text-secondary mb-lg">
        基于 <a href="https://tiptap.dev/" target="_blank" rel="noopener noreferrer">Tiptap</a> 封装的富文本编辑器，支持图片上传、链接插入、格式化等功能。
      </p>

      <a-space direction="vertical" :size="16" style="width: 100%">
        <!-- 基础用法 -->
        <div>
          <h3>基础用法</h3>
          <TiptapEditor v-model="content1" :height="300" placeholder="请输入内容..." />
        </div>

        <!-- 禁用状态 -->
        <div>
          <h3>禁用状态</h3>
          <TiptapEditor v-model="content2" :height="200" disabled />
        </div>

        <!-- 自定义高度 -->
        <div>
          <h3>自定义高度</h3>
          <TiptapEditor v-model="content3" :height="500" />
        </div>

        <!-- 内容预览 -->
        <div>
          <h3>内容预览</h3>
          <a-card title="HTML 输出">
            <pre class="html-preview">{{ content1 || '暂无内容' }}</pre>
          </a-card>
        </div>

        <!-- 操作按钮 -->
        <div>
          <a-space>
            <a-button type="primary" @click="handleSave">保存内容</a-button>
            <a-button @click="handleClear">清空内容</a-button>
            <a-button @click="handleLoadDemo">加载示例</a-button>
          </a-space>
        </div>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'antdv-next'
import TiptapEditor from '@/components/TiptapEditor/index.vue'

const content1 = ref('<p>这是一个基于 <strong>Tiptap</strong> 的富文本编辑器示例。</p>')
const content2 = ref('<p>这是禁用状态的编辑器，无法编辑。</p>')
const content3 = ref('')

const handleSave = () => {
  console.log('保存的内容:', content1.value)
  message.success('内容已保存')
}

const handleClear = () => {
  content1.value = ''
  message.info('内容已清空')
}

const handleLoadDemo = () => {
  content1.value = `
    <h1>欢迎使用 Tiptap 编辑器</h1>
    <p>这是一个功能强大的富文本编辑器，支持以下特性：</p>
    <h2>文本格式</h2>
    <ul>
      <li><strong>粗体文本</strong></li>
      <li><em>斜体文本</em></li>
      <li><s>删除线文本</s></li>
      <li><code>行内代码</code></li>
    </ul>
    <h2>列表</h2>
    <ol>
      <li>有序列表项 1</li>
      <li>有序列表项 2</li>
      <li>有序列表项 3</li>
    </ol>
    <h2>引用</h2>
    <blockquote>
      <p>这是一段引用文本，可以用来突出显示重要内容。</p>
    </blockquote>
    <h2>代码块</h2>
    <pre><code>function hello() {
  console.log('Hello, Tiptap!')
}</code></pre>
    <h2>链接</h2>
    <p>访问 <a href="https://tiptap.dev" target="_blank" rel="noopener noreferrer">Tiptap 官网</a> 了解更多信息。</p>
  `
  message.success('示例内容已加载')
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
