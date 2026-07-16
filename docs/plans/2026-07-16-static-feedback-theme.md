# Static Feedback Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让既有 `Modal.confirm()` 等静态反馈 API 跟随应用当前主题和语言。

**Architecture:** 在根组件集中注册 `ConfigProvider.config().holderRender`，复用页面已有的响应式主题和 locale 配置，不修改业务页面调用方式。

**Tech Stack:** Vue 3、TypeScript、antdv-next、Vite、Vitest

---

### Task 1: 注册静态反馈上下文

**Files:**

- Modify: `src/App.vue`

**Steps:**

1. 引入 `App`、`ConfigProvider`、`h` 和 `watchEffect`。
2. 在主题及 locale computed 定义后，通过 `watchEffect` 更新 `holderRender`。
3. 运行 `npm run type-check`，预期通过。

### Task 2: 回归验证

**Files:**

- Verify: `src/App.vue`

**Steps:**

1. 运行 `npm run lint`。
2. 运行 `npm run test:unit:run`。
3. 运行 `npm run build:check`。
4. 在浏览器中切换暗色主题，打开系统设置删除确认框，确认新弹框使用暗色主题。
