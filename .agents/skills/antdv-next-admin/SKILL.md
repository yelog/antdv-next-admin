---
name: antdv-next-admin
description: 在 Antdv Next Admin 中，根据业务 API 文档或示例响应新增列表与 CRUD 页面，或单独调整现有 ProTable 的搜索项、顺序和请求映射。
---

# Antdv Next Admin 业务页面

从仓库根目录执行。新增业务页走完整流程，已有页面的搜索需求从「独立配置搜索」开始。[项目约定](../../../AGENTS.md)

## 从 API 或示例响应到 CRUD

1. **确定接口契约。** 从接口文档、样例和现有 `src/api/` 确认方法、路径、查询参数、分页字段、响应信封、列表路径、总数和稳定的行 ID。确认筛选空值、枚举类型和写入载荷。只有列表样例时，先交付可验证的读取流程，把未确认的写入契约列为待确认项。
2. **适配 API 和 ProTable。** 在 `src/types/` 定义业务类型，在 `src/api/` 复用 `@/utils/request`。`VITE_API_BASE_URL` 已提供前缀，例如 `getUserList` 请求 `/users`，Mock 端点为 `/api/users`。Axios 响应拦截器返回业务响应信封。用户列表的 `getUserList({ current, pageSize, username, email, status })` 返回 `ApiResponse<PageResult<User>>`，`fetchTableData` 将 `response.data.list` 和 `response.data.total` 映射为 `{ data, total, success: true }`。`total` 是筛选后的全量记录数。按接口显式映射 `ProTableRequestParams`，例如配置管理接口使用 `page`，由 `params.current` 转换。对齐 `src/types/api.ts`、`src/types/pro.ts` 和对应 API。
3. **实现页面和写入。** 页面入口放在 `src/views/<模块>/<业务>/index.vue`，用 `ProTable` 配置列、`row-key` 和请求适配。参考 `src/views/system/user/index.vue` 的 `ProFormModal` 与 `useCrudFormSession`，分别处理新建默认值、编辑回填、表单校验和删除确认。按契约转换表单值，例如用户状态开关映射为 `active` / `inactive`。写入成功后关闭表单并更新列表，`reload()` 回到第一页，`refresh()` 保留当前页。失败时保留可重试的表单并结束提交状态。
4. **接入路由和权限。** 受限页面加入 `src/router/routes.ts` 的 `asyncRoutes`，配置路由标题和 `meta.requiredPermissions`，复用 `src/constants/permissions.ts` 的权限码。用户管理入口是 `/organization/user`，读取权限为 `PERMISSIONS.SYSTEM_USER_VIEW`。按实际权限契约分别控制写入按钮，可用 `v-permission`、`PermissionButton` 或 `can()`，例如表格行操作可用 `hidden: () => !can('system.user.edit')`。`src/views/examples/scaffold/rbac/index.vue` 展示了实际用户权限码。真实接口的授权由服务端校验。演示账号 `admin` 有通配权限，内置 `user` 只有看板权限，验收业务只读时使用拥有该业务读取权限的测试角色。
5. **同步四语和两套 Mock。** 将菜单、表头、表单、枚举标签和反馈的新 key 补齐到 `src/locales/zh-CN.ts`、`en-US.ts`、`ja-JP.ts`、`ko-KR.ts`，在页面用 `$t` 取值。开发 Mock 对照 `mock/handlers/user.mock.ts` 和 `mock/data/users.data.ts`，静态 Demo 对照 `src/mock/browser.ts` 的 Axios 拦截。新增或修改接口时让两套 Mock 使用相同的参数、过滤与分页顺序、响应结构和写入结果。用固定记录验收，静态 Demo 的兜底会为空列表返回成功响应。
6. **验收。** 通过 `npm run dev` 和 `npm run build:demo && npm run preview` 分别检查列表、翻页、搜索重置、空结果、权限和本次涉及的写入，切换四语核对新增文案。先运行相关 Vitest，再按改动运行 `npm run type-check`、`npm run lint` 和 `npm run test:e2e`。回归命令和 Chromium 安装见 [项目测试说明](../../../README.md#测试)。

## 独立配置搜索

搜索项由 `search.formItems` 的 `ProFormItem[]` 定义，按数组顺序渲染。显式提供 `formItems` 后，它会接管从 `columns` 的 `search: true` 自动生成搜索项的流程。表格的展示顺序由 `columns` 管理。[Issue #4](https://github.com/yelog/antdv-next-admin/issues/4)

以 `src/views/system/user/index.vue` 为例，使用已有的性别选项，在独立表单首位增加 `genderFilter`。这个表单字段通过请求适配为 `/api/users` 已支持的 `gender`。示例的改动范围是用户页的搜索字段、查询参数及筛选摘要。

```ts
const searchFormItems = computed<ProFormItem[]>(() => [
  { name: 'genderFilter', label: $t('user.gender'), type: 'select', options: genderOptions.value },
  { name: 'username', label: $t('user.username'), type: 'input' },
  { name: 'email', label: $t('user.email'), type: 'input' },
  { name: 'status', label: $t('user.status'), type: 'select', options: statusOptions.value },
]);
```

在 `fetchTableData` 传给 `getUserList` 的查询参数中加入这一项。如果页面通过 `getUserFilters` 统一生成筛选条件，在该函数中返回 `gender`，并在筛选摘要中加入对应的四语标签。

```ts
gender:
  params.genderFilter === 'male' || params.genderFilter === 'female'
    ? params.genderFilter
    : undefined,
```

管理员登录后打开 `/organization/user` 并展开搜索。检查表单依次为性别、用户名、邮箱、状态，表头顺序与改动前一致。使用 `user@example.com` 和 `female` 搜索，确认 `current=1`、`gender=female`、邮箱参数与结果一致。改选 `male` 应得到空列表、总数 `0`。重置后查询省略性别并回到第一页。

维护者可用同一组功能断言比较启用 Skill 前后的交付结果。[五人试用工作表](references/trial.md)
