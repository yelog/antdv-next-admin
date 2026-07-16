# Department TreeSelect Resolution Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 消除部门管理页面的 TreeSelect 组件解析告警。

**Architecture:** 部门页直接显式依赖 `antdv-next` 的 `TreeSelect`，避免依赖当前 resolver 对多单词模板标签的推断。全局自动导入配置保持不变，其他页面和组件不受影响。

**Tech Stack:** Vue 3、TypeScript、antdv-next、Vite

---

### Task 1: 显式接入 TreeSelect

**Files:**

- Modify: `src/views/system/dept/index.vue:137`

**Step 1:** 把 `<a-tree-select>` 改为 `<TreeSelect>`，保留现有 props。

**Step 2:** 从 `antdv-next` 显式导入 `TreeSelect`。

### Task 2: Static verification

**Step 1:** 执行目标文件格式检查。

**Step 2:** 执行 `npm run type-check && npm run lint && npm run test:unit:run && npm run build`。

**Step 3:** 执行 `git diff --check` 并检查目标 diff。

### Task 3: Browser verification

打开 `/organization/dept` 的新增或编辑弹窗，确认 TreeSelect 正常工作，且控制台不再出现 `Failed to resolve component: a-tree-select`。
