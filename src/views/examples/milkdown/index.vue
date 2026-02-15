<template>
  <div class="milkdown-demo">
    <a-page-header
      title="Milkdown Markdown 编辑器"
      sub-title="基于 @milkdown/vue 的 Markdown 编辑器组件"
    />
    
    <a-row :gutter="[16, 16]">
      <!-- 基础用法 -->
      <a-col :span="24">
        <a-card title="基础用法" :bordered="false">
          <p class="desc">支持实时预览的 Markdown 编辑器，基于 ProseMirror 构建</p>
          <MilkdownEditor
            v-model="content1"
            placeholder="开始输入 Markdown 内容..."
            :height="300"
          />
          <div class="output-section">
            <a-divider />
            <h4>Markdown 源码：</h4>
            <pre class="code-block">{{ content1 }}</pre>
          </div>
        </a-card>
      </a-col>

      <!-- 默认内容 -->
      <a-col :span="24">
        <a-card title="默认内容" :bordered="false">
          <p class="desc">支持设置默认内容，自动渲染为可编辑的富文本</p>
          <MilkdownEditor
            v-model="content2"
            :height="400"
          />
        </a-card>
      </a-col>

      <!-- 只读模式 -->
      <a-col :span="24" :lg="12">
        <a-card title="只读模式" :bordered="false">
          <p class="desc">支持只读模式，用于展示 Markdown 内容</p>
          <MilkdownEditor
            v-model="content3"
            :readonly="true"
            :height="250"
          />
        </a-card>
      </a-col>

      <!-- 特性说明 -->
      <a-col :span="24" :lg="12">
        <a-card title="支持的特性" :bordered="false">
          <a-list size="small">
            <a-list-item>
              <CheckCircleOutlined class="feature-icon" />
              标准 Markdown 语法（CommonMark）
            </a-list-item>
            <a-list-item>
              <CheckCircleOutlined class="feature-icon" />
              GitHub Flavored Markdown（GFM）
            </a-list-item>
            <a-list-item>
              <CheckCircleOutlined class="feature-icon" />
              代码块高亮（Prism）
            </a-list-item>
            <a-list-item>
              <CheckCircleOutlined class="feature-icon" />
              快捷键支持（Slash 命令）
            </a-list-item>
            <a-list-item>
              <CheckCircleOutlined class="feature-icon" />
              工具栏提示（Tooltip）
            </a-list-item>
            <a-list-item>
              <CheckCircleOutlined class="feature-icon" />
              拖拽编辑（Block）
            </a-list-item>
            <a-list-item>
              <CheckCircleOutlined class="feature-icon" />
              历史记录（Undo/Redo）
            </a-list-item>
            <a-list-item>
              <CheckCircleOutlined class="feature-icon" />
              剪贴板支持（粘贴图片）
            </a-list-item>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CheckCircleOutlined } from '@antdv-next/icons'
import MilkdownEditor from '@/components/Milkdown/index.vue'

const content1 = ref('')

const content2 = ref(`# Milkdown 编辑器

## 简介

Milkdown 是一个**插件驱动**的 Markdown 编辑器框架，基于：

- 📝 ProseMirror - 专业的编辑器框架
- 🎨 Remark - Markdown 处理器
- ⚡ Vue 3 - 响应式框架

## 功能特性

### 1. 基础格式

- **粗体** 和 *斜体*
- ~~删除线~~
- 
### 2. 列表

有序列表：
1. 第一项
2. 第二项
3. 第三项

无序列表：
- 苹果
- 香蕉
- 橙子

### 3. 代码

行内代码：\`const hello = 'world'\`

代码块：
\`\`\`typescript
function greet(name: string) {
  console.log(\`Hello, \${name}!\`)
}
\`\`\`

### 4. 表格

| 姓名 | 年龄 | 城市 |
|------|------|------|
| 张三 | 25 | 北京 |
| 李四 | 30 | 上海 |

### 5. 任务列表

- [x] 已完成任务
- [ ] 待办任务

## 链接和图片

[访问 GitHub](https://github.com)

> 这是一段引用文本

---

**提示：** 试试输入 "/" 查看 Slash 命令菜单！
`)

const content3 = ref(`# 只读模式示例

此内容以**只读模式**显示，用户无法编辑。

## 适用场景

1. 文档预览
2. 内容展示
3. 文章阅读

> 💡 提示：可以通过 \`readonly\` 属性控制编辑状态。`)
</script>

<style scoped lang="scss">
.milkdown-demo {
  padding: 24px;
  
  .desc {
    color: var(--color-text-secondary);
    margin-bottom: 16px;
  }
  
  .output-section {
    margin-top: 16px;
    
    h4 {
      margin-bottom: 12px;
      font-weight: 500;
    }
  }
  
  .code-block {
    background: var(--color-bg-layout);
    padding: 16px;
    border-radius: var(--radius-base);
    font-family: 'Courier New', monospace;
    font-size: 13px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .feature-icon {
    color: var(--color-success);
    margin-right: 8px;
  }
}
</style>
