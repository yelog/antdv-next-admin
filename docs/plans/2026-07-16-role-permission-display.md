# Role Permission Display Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修复角色权限多语言名称、默认权限数量和编辑回显，使角色列表与编辑弹窗使用同一份真实权限数据。

**Architecture:** 新增纯函数统一解析 `string | LocalizedText`，角色页与权限页共享该函数。mock 角色从权限树递归筛选并深拷贝权限节点，按角色代码生成稳定的权限集合，不改变 TreeSelect 或角色 API 契约。

**Tech Stack:** Vue 3、TypeScript、vue-i18n、antdv-next、Vitest

---

### Task 1: 多语言文本解析契约

**Files:**

- Create: `src/utils/localizedText.ts`
- Modify: `src/views/system/permission/index.vue`
- Test: `tests/unit/localized-text.spec.ts`

**Step 1: Write the failing test**

覆盖字符串直返、当前语言命中、`zh-CN`/`en-US`/首值回退和空值。

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/localized-text.spec.ts`

Expected: FAIL，因为 `resolveLocalizedText` 尚未从公共工具导出。

**Step 3: Write minimal implementation**

实现：

```ts
export function resolveLocalizedText(
  value: string | LocalizedText | null | undefined,
  locale: string,
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[locale] || value['zh-CN'] || value['en-US'] || Object.values(value)[0] || '';
}
```

权限页删除局部重复函数，改为传入 `getLocale()` 调用公共函数。

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/localized-text.spec.ts`

Expected: PASS。

### Task 2: mock 角色权限派生

**Files:**

- Modify: `mock/data/roles.data.ts`
- Test: `tests/unit/role-permissions.spec.ts`

**Step 1: Write the failing test**

断言 Administrator 拥有完整权限集合，Manager/User/Guest 权限逐级收敛，权限 ID 唯一，角色权限对象不会与原权限树共享引用。

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/role-permissions.spec.ts`

Expected: FAIL，因为当前四个角色的权限数组均为空。

**Step 3: Write minimal implementation**

递归展平 `mockPermissions`，按以下规则选择并深拷贝节点：

- `admin`: 全部节点。
- `manager`: `dashboard.view`、`organization.menu` 及 `system.dept.*`、`system.user.*`、`system.role.view`。
- `user`: `dashboard.view`、`organization.menu`、`system.user.view`。
- `guest`: `dashboard.view`。

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/role-permissions.spec.ts`

Expected: PASS。

### Task 3: 角色权限标签修复

**Files:**

- Modify: `src/views/system/role/index.vue`
- Test: `tests/unit/localized-text.spec.ts`

**Step 1: Write the failing regression assertion**

验证多语言权限名称经解析后与权限代码拼接，不包含 `[object Object]`。

**Step 2: Implement the page mapping**

在 `permissionOptions` 中使用 `resolveLocalizedText(node.name, getLocale())` 生成 `label`，保持 `value` 和树结构不变。

**Step 3: Run focused tests**

Run: `npx vitest run tests/unit/localized-text.spec.ts tests/unit/role-permissions.spec.ts`

Expected: PASS。

### Task 4: 完整验证

**Step 1: Run all unit tests**

Run: `npm run test:unit:run`

Expected: PASS。

**Step 2: Run static checks**

Run: `npm run type-check && npm run lint && npm run format:check`

Expected: 全部退出码为 0。

**Step 3: Run production build**

Run: `npm run build:check`

Expected: 类型检查和 Vite 构建成功。

**Step 4: Browser verification**

用 `admin/123456` 登录，验证角色列表权限数非 0、编辑 Administrator 正确回显、中文和英文权限名称均无 `[object Object]`。
