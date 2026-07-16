# ProTable Search Columns Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 完成 ProTable 搜索列数的准确布局、全局默认配置、动态示例与多语言文档交付。

**Architecture:** ProForm 响应式模式使用 CSS Grid；ProTable 合并脚手架默认值与单表配置；应用示例承担真实交互，VitePress 说明稳定契约。

**Tech Stack:** Vue 3、TypeScript、antdv-next、CSS Grid、Vitest、VitePress

---

### Task 1: 准确响应式布局和配置层级

**Files:**

- Modify: `src/components/Pro/ProForm/index.vue`
- Modify: `src/components/Pro/ProTable/index.vue`
- Modify: `src/settings.ts`
- Test: `tests/unit/pro-table-search.spec.ts`

**Steps:**

1. 为响应式 ProForm 生成 CSS Grid 断点变量。
2. 去除响应式模式对 24 栅格 span 的依赖。
3. 增加脚手架级 `proTable.search.columnsPerRow` 默认值。
4. 让单表 `search.columnsPerRow` 优先覆盖全局配置。
5. 扩充 5 列和折叠数量测试。

### Task 2: 动态高级示例

**Files:**

- Modify: `src/views/examples/scaffold/pro-table-advanced/index.vue`
- Modify: `src/locales/zh-CN.ts`
- Modify: `src/locales/en-US.ts`
- Modify: `src/locales/ja-JP.ts`
- Modify: `src/locales/ko-KR.ts`

**Steps:**

1. 增加 2/3/4/5 列分段选择。
2. 将选择值传给 ProTable 搜索配置。
3. 展示当前等价配置，且不持久化示例状态。

### Task 3: 多语言文档

**Files:**

- Modify: `antdv-next-admin-doc/docs/{components,en/components,ja/components,ko/components}/pro-table.md`
- Modify: `antdv-next-admin-doc/docs/{guide,en/guide,ja/guide,ko/guide}/scaffold-pro-table-advanced.md`

**Steps:**

1. 补充属性类型、默认值、固定值和响应式示例。
2. 说明全局配置与页面覆盖优先级。
3. 在高级示例指南说明动态控制用途。

### Task 4: 验证

**Steps:**

1. 主应用运行 `npm run type-check`、`npm run lint`、`npm run test:unit:run`、`npm run build:check`。
2. 文档运行 `pnpm docs:check` 和 `pnpm build`。
3. 浏览器验证 2/3/4/5 列和折叠行为。
