# Auth-Aware Not Found Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 统一所有 404 内容，并让全局 404 在已登录时显示后台布局、未登录时全屏显示。

**Architecture:** 公共 `NotFoundContent` 组件负责唯一的 404 视觉内容；全局错误页依据 token 选择直接全屏渲染或通过 `AdminLayout` 渲染。`AdminLayout` 新增可选默认插槽，同时保留无插槽时的现有路由出口，示例 404 直接复用公共组件。

**Tech Stack:** Vue 3、TypeScript、Vue Router、Pinia、Antdv Next、Vitest

---

### Task 1: 固化登录状态对应的 404 模式

**Files:**
- Modify: `tests/unit/router-not-found.spec.ts`
- Modify: `src/router/routeRecovery.ts`

**Step 1: 写失败测试**

在 `router-not-found.spec.ts` 中新增两条断言：有 token 时 `shouldUseAdminNotFoundLayout(true)` 为 `true`，无 token 时为 `false`。

**Step 2: 运行测试确认失败**

Run: `npm run test:unit:run -- tests/unit/router-not-found.spec.ts`

Expected: FAIL，提示 `shouldUseAdminNotFoundLayout` 尚未导出。

**Step 3: 最小实现**

在 `routeRecovery.ts` 增加纯函数：

```ts
export function shouldUseAdminNotFoundLayout(hasToken: boolean) {
  return hasToken;
}
```

**Step 4: 运行测试确认通过**

Run: `npm run test:unit:run -- tests/unit/router-not-found.spec.ts`

Expected: PASS。

**Step 5: 提交**

```bash
git add src/router/routeRecovery.ts tests/unit/router-not-found.spec.ts
git commit -m "test(router): cover auth-aware 404 layout"
```

### Task 2: 抽取公共 404 内容组件

**Files:**
- Create: `src/components/Exception/NotFoundContent.vue`
- Modify: `src/views/examples/exception/404.vue`

**Step 1: 创建公共组件**

组件使用 `<a-result status="404">`，统一读取 `exampleException.404title`、`exampleException.404description` 和 `error.backHome`，点击按钮通过 router 跳转 `/`。组件本身不包含页面尺寸、卡片或后台布局。

**Step 2: 替换示例页内容**

保留示例页现有 `page-container`、`card` 和最小高度，只在其中渲染 `<NotFoundContent />`，删除重复的 router 逻辑。

**Step 3: 验证类型与格式**

Run: `npm run type-check && npm run format:check`

Expected: 两条命令均退出 0。

**Step 4: 提交**

```bash
git add src/components/Exception/NotFoundContent.vue src/views/examples/exception/404.vue
git commit -m "refactor(error): extract shared 404 content"
```

### Task 3: 让 AdminLayout 支持直接承载错误内容

**Files:**
- Modify: `src/components/Layout/AdminLayout.vue`

**Step 1: 增加可选默认插槽**

在垂直和水平两套页面内容区域中，将现有路由出口调整为：存在 `$slots.default` 时渲染 `<slot />`，否则渲染原有带 transition、keep-alive 和动态 key 的 `<router-view>`。不要改变普通路由的现有缓存和动画行为。

**Step 2: 验证类型与构建**

Run: `npm run type-check && npm run build`

Expected: 类型检查和 Vite 构建均通过。

**Step 3: 提交**

```bash
git add src/components/Layout/AdminLayout.vue
git commit -m "feat(layout): support direct page content slot"
```

### Task 4: 根据登录状态组合全局 404

**Files:**
- Modify: `src/views/error/404.vue`

**Step 1: 使用认证状态选择布局**

读取 `useAuthStore().token`，通过 `shouldUseAdminNotFoundLayout(Boolean(authStore.token))` 计算显示模式：

- 已登录：`<AdminLayout><NotFoundContent /></AdminLayout>`，公共内容置于与普通页面一致的 `page-container`/`card` 容器内。
- 未登录：全屏居中容器中渲染 `<NotFoundContent />`。

删除旧页面重复的 404 文案、按钮和 router 逻辑。

**Step 2: 运行目标测试和类型检查**

Run: `npm run test:unit:run -- tests/unit/router-not-found.spec.ts && npm run type-check`

Expected: 全部通过。

**Step 3: 提交**

```bash
git add src/views/error/404.vue
git commit -m "feat(router): render 404 by auth state"
```

### Task 5: 完整回归验证

**Files:**
- Verify only

**Step 1: 运行全部自动检查**

Run: `npm run test:unit:run && npm run lint && npm run format:check && npm run build:check`

Expected: 所有命令退出 0。

**Step 2: 手工验证关键路径**

- 退出登录后访问 `/404`：显示全屏 404，无后台导航。
- 退出登录后访问任意未知地址：保留原 URL，显示全屏 404。
- 登录后访问 `/404`：显示侧边栏、顶部栏、标签栏及统一 404 内容。
- 登录后访问任意未知地址：保留原 URL，并显示后台布局内的统一 404。
- 登录后访问 `/examples/exception/404`：内容与全局 404 一致且不重复嵌套布局。
- 登录后刷新一个动态权限路由：先恢复路由，不误入 404。

