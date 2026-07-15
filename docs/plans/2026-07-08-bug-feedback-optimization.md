# Bug Feedback Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修复用户反馈中已确认的国际化、主题、ProTable 表单状态、权限切换和关键示例可用性问题，并补充低风险组件增强能力。

**Architecture:** 优先收敛横切能力：全局 `ConfigProvider` 负责组件库 locale、主题 token 和组件默认属性；认证退出流程统一清理 auth、permission、tabs 和动态路由；Pro 组件内部负责自身生命周期状态清理。示例页只做响应式 i18n 和可用性修复，不做大规模视觉重构。

**Tech Stack:** Vue 3 `<script setup>`、Pinia、vue-i18n、antdv-next、dayjs、TypeScript strict、Vite。

---

## 需求分析

### 必须修复

- `DatePicker/RangePicker/Modal` 等组件库内置文案要随当前语言变化。
- ProTable 内置 CRUD 弹窗在创建/编辑切换时不得残留上一次校验错误。
- 不同角色用户切换时必须重建权限路由和菜单，不得沿用上一用户权限。
- 示例表单中的 label、placeholder、rules 文案必须随语言变化。
- Tiptap 选区样式不能依赖未定义 CSS 变量。
- 拼图验证码必须避免跨域 canvas 失败，并支持 pointer/touch 操作。

### 增强项

- Select/TreeSelect 默认支持本地搜索，同时允许业务传入远程搜索参数。
- ProTable 搜索区域支持配置每行列数。
- 全局按钮默认大小纳入 `appDefaultSettings` 和 `ConfigProvider`。

### 后续单独处理

- ProTable 圆角层级、收藏聚合入口、通知闪烁、CSS 文件结构重整属于视觉/信息架构调整，建议单独开任务避免和 bug 修复混杂。

## 实施任务

### Task 1: 全局 locale、dayjs 和组件默认配置

**Files:**
- Modify: `src/App.vue`
- Modify: `src/locales/index.ts`
- Modify: `src/settings.ts`

**Steps:**
1. 在 `App.vue` 引入 antdv-next locale 包，并根据 `useI18n().locale` 计算 `ConfigProvider.locale`。
2. 在 `setLocale` 中同步 `dayjs.locale()`，并初始化保存语言对应的 dayjs locale。
3. 在 `settings.ts` 增加 `button` 默认配置，并传给 `ConfigProvider`。
4. 运行 `npm run type-check` 验证类型。

### Task 2: ProTable/ProForm 弹窗生命周期

**Files:**
- Modify: `src/components/Pro/ProForm/index.vue`
- Modify: `src/components/Pro/ProTable/index.vue`
- Modify: `src/components/Pro/ProModal/index.vue`

**Steps:**
1. `ProForm` 暴露 `clearValidate`。
2. ProTable 内置 CRUD 弹窗打开创建/编辑前重置校验，取消/关闭/提交成功后清理状态。
3. `ProModal` 默认 `okText/cancelText` 使用 `$t()`，但允许外部覆盖。
4. `Modal.confirm` 明确传入 `okText/cancelText`。

### Task 3: 权限切换隔离

**Files:**
- Modify: `src/stores/auth.ts`
- Modify: `src/stores/tabs.ts`
- Modify: `src/router/guards.ts`
- Modify: `src/components/Layout/AvatarDropdown.vue`

**Steps:**
1. `tabs` store 增加内存重置方法。
2. 登出确认后清理 `permissionStore.resetPermission()`、tabs 内存与本地缓存。
3. 删除动态路由，避免 Vue Router 继续保留旧用户可访问路由。
4. 重新登录时如已有旧会话，先清理认证和权限状态。

### Task 4: 示例 i18n、Tiptap、Captcha

**Files:**
- Modify: `src/views/examples/form/index.vue`
- Modify: `src/views/examples/scaffold/complex-form/index.vue`
- Modify: `src/components/Editor/index.vue`
- Modify: `src/components/Captcha/src/PuzzleCaptcha.vue`

**Steps:**
1. 表单示例 `formItems` 改为 `computed`。
2. 复杂表单 rules 改为 `computed`，保证语言切换后重新生成。
3. Tiptap `::selection` 改为项目主题变量。
4. PuzzleCaptcha 默认使用同源 SVG data URL，改用 pointer events，增加图片失败 fallback。

### Task 5: 低风险组件增强

**Files:**
- Modify: `src/types/pro.ts`
- Modify: `src/components/Pro/ProForm/FormItemRender.vue`
- Modify: `src/components/Pro/ProTable/composables/useProTableSearch.ts`
- Modify: `src/components/Pro/ProTable/index.vue`

**Steps:**
1. `ProFormItem` 增加搜索相关类型字段。
2. Select/TreeSelect 默认本地搜索；业务可通过 `remoteSearch` 或 `props` 覆盖。
3. `ProTableSearch` 增加 `columnsPerRow` 并接入折叠计算。

### Task 6: 验证

**Commands:**
- `npm run type-check`
- `npm run lint`

**Manual Checks:**
- 切换中/英/日/韩后 DatePicker、Modal 按钮、表单示例文案同步变化。
- admin 登录后退出，再以 user 登录，菜单和受限页面权限不沿用 admin。
- ProTable 编辑校验失败后取消，再创建，不显示旧校验错误。
- 拼图验证码在桌面鼠标和移动端触摸均可拖动。
