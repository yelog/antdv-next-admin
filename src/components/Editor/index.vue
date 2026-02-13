<template>
  <div class="tiptap-editor-wrapper" :class="{ disabled }">
    <!-- 工具栏 -->
    <div v-if="editor" class="editor-toolbar">
      <a-space :size="4" wrap>
        <!-- 文本格式 -->
        <a-button
          size="small"
          :type="editor.isActive('bold') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleBold().run()"
        >
          <template #icon><BoldOutlined /></template>
        </a-button>

        <a-button
          size="small"
          :type="editor.isActive('italic') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <template #icon><ItalicOutlined /></template>
        </a-button>

        <a-button
          size="small"
          :type="editor.isActive('strike') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleStrike().run()"
        >
          <template #icon><StrikethroughOutlined /></template>
        </a-button>

        <a-divider type="vertical" />

        <!-- 标题 -->
        <a-button
          size="small"
          :type="editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          H1
        </a-button>

        <a-button
          size="small"
          :type="editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          H2
        </a-button>

        <a-button
          size="small"
          :type="editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          H3
        </a-button>

        <a-divider type="vertical" />

        <!-- 列表 -->
        <a-button
          size="small"
          :type="editor.isActive('bulletList') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          <template #icon><UnorderedListOutlined /></template>
        </a-button>

        <a-button
          size="small"
          :type="editor.isActive('orderedList') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          <template #icon><OrderedListOutlined /></template>
        </a-button>

        <a-divider type="vertical" />

        <!-- 引用和代码 -->
        <a-button
          size="small"
          :type="editor.isActive('blockquote') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleBlockquote().run()"
        >
          <template #icon><MessageOutlined /></template>
        </a-button>

        <a-button
          size="small"
          :type="editor.isActive('codeBlock') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleCodeBlock().run()"
        >
          <template #icon><CodeOutlined /></template>
        </a-button>

        <a-divider type="vertical" />

        <!-- 图片和链接 -->
        <a-upload
          :show-upload-list="false"
          :before-upload="handleImageUpload"
          accept="image/*"
        >
          <a-button size="small">
            <template #icon><PictureOutlined /></template>
          </a-button>
        </a-upload>

        <a-button size="small" @click="showLinkModal">
          <template #icon><LinkOutlined /></template>
        </a-button>

        <a-divider type="vertical" />

        <!-- 撤销重做 -->
        <a-button
          size="small"
          :disabled="!editor.can().undo()"
          @click="editor.chain().focus().undo().run()"
        >
          <template #icon><UndoOutlined /></template>
        </a-button>

        <a-button
          size="small"
          :disabled="!editor.can().redo()"
          @click="editor.chain().focus().redo().run()"
        >
          <template #icon><RedoOutlined /></template>
        </a-button>
      </a-space>
    </div>

    <!-- 编辑器内容区 -->
    <editor-content :editor="editor" class="editor-content" />

    <!-- 链接弹窗 -->
    <a-modal
      v-model:open="linkModalVisible"
      title="插入链接"
      @ok="insertLink"
    >
      <a-form layout="vertical">
        <a-form-item label="链接地址">
          <a-input v-model:value="linkUrl" placeholder="https://example.com" />
        </a-form-item>
        <a-form-item label="链接文本">
          <a-input v-model:value="linkText" placeholder="链接文本" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  MessageOutlined,
  CodeOutlined,
  PictureOutlined,
  LinkOutlined,
  UndoOutlined,
  RedoOutlined
} from '@antdv-next/icons'
import { message } from 'antdv-next'
import type { UploadProps } from 'antdv-next'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  disabled: false,
  height: 400
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

// 链接弹窗
const linkModalVisible = ref(false)
const linkUrl = ref('')
const linkText = ref('')

// 初始化编辑器
const editor = useEditor({
  content: props.modelValue,
  editable: !props.disabled,
  extensions: [
    StarterKit,
    Image.configure({
      inline: true,
      allowBase64: true
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    }),
    Placeholder.configure({
      placeholder: props.placeholder
    })
  ],
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    emit('update:modelValue', html)
    emit('change', html)
  }
})

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== editor.value.getHTML()) {
    editor.value.commands.setContent(newValue, false)
  }
})

// 监听禁用状态
watch(() => props.disabled, (disabled) => {
  if (editor.value) {
    editor.value.setEditable(!disabled)
  }
})

// 图片上传
const handleImageUpload: UploadProps['beforeUpload'] = async (file) => {
  if (!editor.value) return false

  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    message.error('只能上传图片文件')
    return false
  }

  // 检查文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    message.error('图片大小不能超过 5MB')
    return false
  }

  try {
    // 方式1: 转换为 Base64（适合小图片）
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      editor.value?.chain().focus().setImage({ src: base64 }).run()
    }
    reader.readAsDataURL(file)

    // 方式2: 上传到服务器（推荐）
    // const formData = new FormData()
    // formData.append('file', file)
    // const response = await fetch('/api/upload', {
    //   method: 'POST',
    //   body: formData
    // })
    // const data = await response.json()
    // editor.value?.chain().focus().setImage({ src: data.url }).run()

    message.success('图片插入成功')
  } catch (error) {
    console.error('图片上传失败:', error)
    message.error('图片上传失败')
  }

  return false // 阻止默认上传行为
}

// 显示链接弹窗
const showLinkModal = () => {
  const { href } = editor.value?.getAttributes('link') || {}
  linkUrl.value = href || ''
  linkText.value = editor.value?.state.doc.textBetween(
    editor.value.state.selection.from,
    editor.value.state.selection.to
  ) || ''
  linkModalVisible.value = true
}

// 插入链接
const insertLink = () => {
  if (!linkUrl.value) {
    message.warning('请输入链接地址')
    return
  }

  if (!editor.value) return

  // 如果有选中文本，直接添加链接
  if (editor.value.state.selection.empty) {
    // 没有选中文本，插入新链接
    editor.value
      .chain()
      .focus()
      .insertContent(`<a href="${linkUrl.value}">${linkText.value || linkUrl.value}</a>`)
      .run()
  } else {
    // 有选中文本，添加链接
    editor.value
      .chain()
      .focus()
      .setLink({ href: linkUrl.value })
      .run()
  }

  linkModalVisible.value = false
  linkUrl.value = ''
  linkText.value = ''
}

// 组件销毁时销毁编辑器
onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped lang="scss">
.tiptap-editor-wrapper {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  background: var(--color-bg-container);

  &.disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}

.editor-toolbar {
  padding: 8px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-layout);

  :deep(.ant-btn-sm) {
    min-width: 32px;
    height: 28px;
  }

  :deep(.ant-divider-vertical) {
    height: 20px;
    margin: 0 4px;
  }
}

.editor-content {
  height: v-bind(height + 'px');
  overflow-y: auto;

  :deep(.ProseMirror) {
    padding: 12px 16px;
    min-height: 100%;
    outline: none;

    /* 占位符样式 */
    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: var(--color-text-placeholder);
      pointer-events: none;
      height: 0;
    }

    /* 基础样式 */
    h1, h2, h3, h4, h5, h6 {
      line-height: 1.3;
      margin-top: 1em;
      margin-bottom: 0.5em;
      font-weight: 600;
    }

    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }

    p {
      margin: 0.5em 0;
    }

    ul, ol {
      padding-left: 1.5em;
      margin: 0.5em 0;
    }

    blockquote {
      border-left: 3px solid var(--ant-primary-color);
      padding-left: 1em;
      margin: 1em 0;
      color: var(--color-text-secondary);
    }

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
      border-radius: 4px;
      overflow-x: auto;
      margin: 1em 0;

      code {
        background: none;
        padding: 0;
      }
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 0.5em 0;
    }

    a {
      color: var(--ant-primary-color);
      text-decoration: none;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }

    /* 选中样式 */
    ::selection {
      background: var(--ant-primary-color-deprecated-l-35);
    }
  }
}
</style>
