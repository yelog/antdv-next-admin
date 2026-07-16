# Role Permission Type Tags Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在角色编辑权限树节点末尾显示菜单、按钮和 API 的彩色类别 Tag，并保持选中标签、搜索和提交行为不变。

**Architecture:** 页面级纯函数负责把 `Permission['type']` 映射为颜色和多语言键；角色页通过 TreeSelect 原生 `treeTitleRender` 渲染标题与 Tag。公共 ProForm 继续只负责原生 props 透传，不增加权限业务契约。

**Tech Stack:** Vue 3、TypeScript、antdv-next TreeSelect/Tag、vue-i18n、Vitest

---

### Task 1: 权限类别展示配置

**Files:**

- Create: `src/views/system/role/permissionTypePresentation.ts`
- Test: `tests/unit/role-permission-type-presentation.spec.ts`

**Step 1: Write the failing test**

断言：

```ts
expect(getPermissionTypePresentation('menu')).toEqual({
  color: 'blue',
  labelKey: 'permission.menu',
});
```

并覆盖 `button -> green`、`api -> purple` 和未知值返回 `null`。

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/role-permission-type-presentation.spec.ts`

Expected: FAIL，因为展示配置模块尚不存在。

**Step 3: Write minimal implementation**

以 `satisfies Record<Permission['type'], PermissionTypePresentation>` 定义完整映射，并导出纯函数：

```ts
export function getPermissionTypePresentation(type: Permission['type'] | undefined) {
  return type ? PERMISSION_TYPE_PRESENTATIONS[type] ?? null : null;
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/role-permission-type-presentation.spec.ts`

Expected: PASS。

### Task 2: TreeSelect 节点渲染接线

**Files:**

- Modify: `src/views/system/role/index.vue`

**Step 1: Add typed renderer**

导入 `TreeSelectProps`、Vue `h`、Antdv Next `Tag` 和展示配置函数。定义 `TreeNodeData` 最小类型，避免 `any` 或类型抑制。

**Step 2: Render title and category tag**

渲染函数通过 `nodeData.value` 查询 `permissionMap`。找到类别时返回：

```ts
h('span', { class: 'permission-tree-title' }, [
  h('span', { class: 'permission-tree-title__text' }, String(nodeData.title ?? '')),
  h(Tag, { color: presentation.color }, () => $t(presentation.labelKey)),
]);
```

找不到权限对象或类别时返回原始标题。

**Step 3: Pass renderer through ProForm props**

在权限 TreeSelect 的 `props` 中增加 `treeTitleRender: renderPermissionTreeTitle`，不设置 `tagRender`。

**Step 4: Add scoped styles**

为节点标题增加 inline-flex、间距和最小宽度约束；Tag 清除多余外边距。颜色使用组件 `color` 属性，不写硬编码背景色。

### Task 3: Static and regression verification

**Step 1: Run focused tests**

Run: `npx vitest run tests/unit/role-permission-type-presentation.spec.ts tests/unit/pro-form-select-search.spec.ts`

Expected: PASS。

**Step 2: Run project checks**

Run: `npm run test:unit:run && npm run type-check && npm run lint && npm run build:check`

Expected: 单测、类型、lint 和构建通过；允许报告仓库已有 lint 警告。

**Step 3: Run targeted formatting check**

Run: `npx oxfmt --check src/views/system/role/index.vue src/views/system/role/permissionTypePresentation.ts tests/unit/role-permission-type-presentation.spec.ts`

Expected: PASS。

### Task 4: Browser verification

**Step 1: Open role edit modal**

使用 `admin/123456` 登录并打开 `/organization/role`，编辑 Administrator，展开权限树。

**Step 2: Verify visible behavior**

- 菜单、按钮、API 节点分别显示蓝、绿、紫色类别 Tag。
- 输入框选中标签仍只有权限名称和代码。
- 搜索权限名称或代码仍能命中节点。
- 页面控制台无新增 warning/error。
