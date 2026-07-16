# Route Menu Icon Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让路由菜单完整支持 IconPicker 可配置的 Antdv、Iconify 和本地 SVG 图标，同时兼容现有裸 Antdv 图标名。

**Architecture:** 抽取纯函数统一识别图标协议，由现有 `Icon` 组件负责实际加载和渲染。布局层使用单一 `renderIcon` 工具生成图标 VNode，移除菜单专用 Antdv 白名单。

**Tech Stack:** Vue 3、TypeScript、@antdv-next/icons、@iconify/vue、Vitest

---

### Task 1: 定义图标协议契约

**Files:**

- Create: `tests/unit/route-icon.spec.ts`
- Create: `src/utils/iconName.ts`

1. 添加覆盖裸 Antdv、带前缀 Antdv、Iconify、SVG 和空值的失败测试。
2. 运行 `npm run test:unit:run -- tests/unit/route-icon.spec.ts`，确认测试失败。
3. 实现最小图标分类函数。
4. 重跑定向测试，确认通过。

### Task 2: 统一菜单图标节点生成

**Files:**

- Modify: `src/utils/icon.ts`
- Modify: `src/components/Icon/index.vue`
- Test: `tests/unit/route-icon.spec.ts`

1. 添加 `renderIcon` VNode 契约测试。
2. 让 `Icon` 组件使用共享分类函数。
3. 用通用 `Icon` 组件实现 `renderIcon`，空值返回 `undefined`。
4. 重跑定向测试。

### Task 3: 迁移全部路由图标消费端

**Files:**

- Modify: `src/components/Layout/Sidebar.vue`
- Modify: `src/components/Layout/AdminLayout.vue`
- Modify: `src/components/Layout/TabBar.vue`
- Modify: `src/components/Layout/GlobalSearch.vue`
- Modify: `src/components/Layout/MenuItem.vue`

1. 将 `resolveIcon` 调用替换为 `renderIcon`。
2. 保持各入口原有 CSS class 和空值行为。
3. 搜索确认布局层不再调用旧解析器。

### Task 4: 完整验证

**Files:**

- Verify all touched files

1. 运行 `npm run test:unit:run`，预期全部通过。
2. 运行 `npm run type-check`，预期无类型错误。
3. 运行 `npm run lint`，预期无 lint 错误。
4. 运行 touched-files `npx oxfmt --check ...`，预期格式通过。
5. 运行 `npm run build`，预期生产构建成功。
6. 检查最终 diff，确认没有无关修改。
