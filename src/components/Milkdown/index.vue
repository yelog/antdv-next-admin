<template>
  <div class="milkdown-editor" :class="{ 'dark': isDark }">
    <div ref="editorRef" class="milkdown-container" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { history } from '@milkdown/plugin-history'
import { clipboard } from '@milkdown/plugin-clipboard'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { prism } from '@milkdown/plugin-prism'
import { tooltip } from '@milkdown/plugin-tooltip'
import { slash } from '@milkdown/plugin-slash'
import { block } from '@milkdown/plugin-block'

interface Props {
  modelValue?: string
  placeholder?: string
  readonly?: boolean
  height?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  readonly: false,
  height: 400
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const editorRef = ref<HTMLElement>()
const editorInstance = ref<Editor>()
const isDark = ref(false)

// 检测暗色主题
const checkDarkTheme = () => {
  isDark.value = document.documentElement.classList.contains('dark')
}

onMounted(async () => {
  if (!editorRef.value) return
  
  checkDarkTheme()
  
  const editor = await Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, editorRef.value)
      ctx.set(defaultValueCtx, props.modelValue)
      
      // 配置编辑器视图
      ctx.update(editorViewOptionsCtx, (prev) => ({
        ...prev,
        editable: () => !props.readonly
      }))
      
      // 监听内容变化
      ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
        if (markdown !== prevMarkdown) {
          emit('update:modelValue', markdown)
          emit('change', markdown)
        }
      })
    })
    .use(nord)
    .use(commonmark)
    .use(gfm)
    .use(history)
    .use(clipboard)
    .use(listener)
    .use(prism)
    .use(tooltip)
    .use(slash)
    .use(block)
    .create()
  
  editorInstance.value = editor
})

onUnmounted(() => {
  editorInstance.value?.destroy()
})

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (editorInstance.value && newValue !== editorInstance.value.action((ctx) => {
    return ctx.get(defaultValueCtx)
  })) {
    editorInstance.value.action((ctx) => {
      const view = ctx.editorView
      const state = view.state
      const tr = state.tr.replaceWith(0, state.doc.content.size, state.schema.text(newValue))
      view.dispatch(tr)
    })
  }
})

// 监听只读状态
watch(() => props.readonly, (readonly) => {
  editorInstance.value?.action((ctx) => {
    ctx.update(editorViewOptionsCtx, (prev) => ({
      ...prev,
      editable: () => !readonly
    }))
  })
})
</script>

<style scoped lang="scss">
.milkdown-editor {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  overflow: hidden;
  background: var(--color-bg-container);
  
  &.dark {
    :deep(.milkdown) {
      --nord0: #2e3440;
      --nord1: #3b4252;
      --nord2: #434c5e;
      --nord3: #4c566a;
      --nord4: #d8dee9;
      --nord5: #e5e9f0;
      --nord6: #eceff4;
      --nord7: #8fbcbb;
      --nord8: #88c0d0;
      --nord9: #81a1c1;
      --nord10: #5e81ac;
      --nord11: #bf616a;
      --nord12: #d08770;
      --nord13: #ebcb8b;
      --nord14: #a3be8c;
      --nord15: #b48ead;
    }
  }
}

.milkdown-container {
  :deep(.milkdown) {
    padding: 16px;
    min-height: v-bind(height + 'px');
    
    // 编辑器样式覆盖
    .editor {
      min-height: inherit;
      outline: none;
    }
    
    // 段落
    p {
      margin: 0.75em 0;
      line-height: 1.6;
    }
    
    // 标题
    h1, h2, h3, h4, h5, h6 {
      margin: 1em 0 0.5em;
      font-weight: 600;
      line-height: 1.25;
    }
    
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }
    h5 { font-size: 0.875em; }
    h6 { font-size: 0.85em; }
    
    // 列表
    ul, ol {
      padding-left: 1.5em;
      margin: 0.75em 0;
    }
    
    li {
      margin: 0.25em 0;
    }
    
    // 引用
    blockquote {
      border-left: 4px solid var(--color-primary);
      padding-left: 1em;
      margin: 1em 0;
      color: var(--color-text-secondary);
      font-style: italic;
    }
    
    // 代码
    code {
      background: var(--color-bg-layout);
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 0.9em;
      font-family: 'Courier New', monospace;
    }
    
    pre {
      background: var(--color-bg-layout);
      padding: 1em;
      border-radius: var(--radius-base);
      overflow-x: auto;
      margin: 1em 0;
      
      code {
        background: none;
        padding: 0;
      }
    }
    
    // 链接
    a {
      color: var(--color-primary);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    // 图片
    img {
      max-width: 100%;
      height: auto;
      border-radius: var(--radius-base);
    }
    
    // 表格
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      
      th, td {
        border: 1px solid var(--color-border);
        padding: 8px 12px;
        text-align: left;
      }
      
      th {
        background: var(--color-bg-layout);
        font-weight: 600;
      }
    }
    
    // 分割线
    hr {
      border: none;
      border-top: 1px solid var(--color-border);
      margin: 1.5em 0;
    }
    
    // 任务列表
    .task-list-item {
      list-style: none;
      
      input {
        margin-right: 0.5em;
      }
    }
    
    // 选中样式
    ::selection {
      background: var(--color-primary-deprecated-l-35);
    }
  }
}
</style>
