# Contributing to Antdv Next Admin

感谢你考虑为 Antdv Next Admin 做贡献！这个项目是一个基于 Vue 3 + TypeScript 的现代化后台管理系统脚手架。

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [项目结构](#项目结构)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [问题反馈](#问题反馈)

## 行为准则

本项目采用贡献者公约作为行为准则。参与此项目即表示你同意遵守其条款。请阅读 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) 了解详情。

## 如何贡献

### 报告 Bug

如果你发现了 bug，请通过 [GitHub Issues](../../issues) 提交报告。提交前请：

1. 搜索现有 issues，确认该问题尚未被报告
2. 使用 Bug 报告模板填写详细信息
3. 提供可复现的步骤

### 提出新功能

如果你有新功能的想法：

1. 先在 [Discussions](../../discussions) 中讨论你的想法
2. 确认功能符合项目定位
3. 使用功能请求模板提交 issue

### 提交代码

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 进行更改
4. 提交更改 (`git commit -m 'feat: add amazing feature'`)
5. 推送到分支 (`git push origin feature/amazing-feature`)
6. 创建 Pull Request

## 开发环境设置

### 环境要求

- Node.js >= 18
- pnpm >= 8（推荐）或 npm >= 8
- Git

### 安装步骤

```bash
# 克隆你的 fork
git clone https://github.com/your-username/antdv-next-admin.git
cd antdv-next-admin

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

### 可用命令

```bash
# 开发
pnpm run dev              # 启动开发服务器 (http://localhost:3000)

# 构建
pnpm run build            # 生产构建
pnpm run build:check      # 类型检查 + 构建
pnpm run preview          # 预览生产构建

# 代码质量
pnpm run type-check       # TypeScript 类型检查
pnpm run lint             # ESLint 检查
pnpm run lint:fix         # 自动修复 ESLint 问题
pnpm run format           # Prettier 格式化
pnpm run format:check     # 检查格式化

# 测试
pnpm run test:unit        # 运行单元测试
pnpm run test:unit:coverage  # 运行测试并生成覆盖率报告
pnpm run test:e2e         # 运行 E2E 测试
pnpm run test:e2e:ui      # E2E 测试 UI 模式
```

## 项目结构

```
antdv-next-admin/
├── .github/              # GitHub 配置
│   └── workflows/        # GitHub Actions 工作流
├── docs/                 # 文档资源
├── mock/                 # Mock 数据
│   ├── data/             # 数据源
│   └── handlers/         # 请求处理器
├── public/               # 静态资源
├── scripts/              # 脚本工具
│   └── generator/        # 代码生成器
├── src/
│   ├── api/              # API 接口层
│   ├── assets/           # 静态资源
│   │   └── styles/       # 全局样式
│   ├── components/       # 组件
│   │   ├── Layout/       # 布局组件
│   │   ├── Pro/          # Pro 高级组件
│   │   ├── Permission/   # 权限组件
│   │   ├── Editor/       # 富文本编辑器
│   │   ├── Captcha/      # 验证码组件
│   │   └── IconPicker/   # 图标选择器
│   ├── composables/      # 组合式函数
│   ├── directives/       # 自定义指令
│   ├── locales/          # 国际化文件
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   └── views/            # 页面视图
├── tests/                # 测试文件
│   ├── unit/             # 单元测试
│   └── e2e/              # E2E 测试
└── ...配置文件
```

## 代码规范

### TypeScript

- 启用严格模式
- 避免使用 `any` 类型
- 为所有公共 API 提供类型定义
- 使用 `interface` 定义对象类型，`type` 定义联合类型

### Vue 组件

- 使用 Composition API + `<script setup>` 语法
- 组件命名使用 PascalCase
- Props 必须定义类型
- 使用 CSS Variables 进行样式定制

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const emit = defineEmits<{
  update: [value: number]
}>()
</script>

<template>
  <div class="component">
    <h2>{{ title }}</h2>
  </div>
</template>

<style scoped>
.component {
  /* 使用 CSS 变量 */
  color: var(--text-color);
}
</style>
```

### Pinia Store

使用 setup 语法：

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMyStore = defineStore('my-store', () => {
  // State
  const data = ref<string | null>(null)

  // Getters
  const hasData = computed(() => data.value !== null)

  // Actions
  const fetchData = async () => {
    // ...
  }

  return { data, hasData, fetchData }
})
```

### 样式规范

- 优先使用 CSS Variables
- 使用 SCSS 编写复杂样式
- 遵循 BEM 命名规范（可选）

## 提交规范

本项目采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交格式

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### 类型 (type)

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 重构（既非新功能也非 Bug 修复） |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建过程或辅助工具的变动 |
| `ci` | CI 配置变动 |
| `revert` | 回退提交 |

### 范围 (scope)

常用的范围：

- `api` - API 相关
- `auth` - 认证相关
- `components` - 组件相关
- `router` - 路由相关
- `store` - 状态管理相关
- `styles` - 样式相关
- `types` - 类型定义相关
- `utils` - 工具函数相关

### 示例

```bash
# 新功能
git commit -m "feat(components): add ProUpload component"

# Bug 修复
git commit -m "fix(auth): handle token refresh correctly"

# 文档更新
git commit -m "docs: update installation guide"

# 重构
git commit -m "refactor(utils): simplify request interceptor"
```

## Pull Request 流程

### 提交前检查

- [ ] 代码通过 `pnpm run type-check` 类型检查
- [ ] 代码通过 `pnpm run lint` ESLint 检查
- [ ] 代码已格式化 `pnpm run format`
- [ ] 单元测试通过 `pnpm run test:unit`
- [ ] 更新了相关文档

### PR 标题格式

PR 标题应遵循与提交信息相同的格式：

```
feat(scope): description
fix(scope): description
```

### PR 描述模板

```markdown
## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档更新
- [ ] 其他：___

## 变更说明
简要描述你的变更内容。

## 相关 Issue
Closes #xxx

## 测试说明
描述如何测试这些变更。

## 截图
如有 UI 变更，请提供截图。

## 检查清单
- [ ] 代码遵循项目编码规范
- [ ] 已添加必要的测试
- [ ] 文档已更新
- [ ] 提交信息遵循规范
```

### 审核流程

1. 至少需要一位维护者审核通过
2. 所有 CI 检查必须通过
3. 解决所有审核意见后可以合并

## 问题反馈

如果你有任何问题：

1. 查看 [FAQ](../../wiki/FAQ)（如有）
2. 在 [Discussions](../../discussions) 中提问
3. 创建 [Issue](../../issues/new)

---

再次感谢你对 Antdv Next Admin 的贡献！