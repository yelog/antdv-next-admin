# Antdv Next Admin

一个基于 Vue 3.5、TypeScript 6、Vite 8 和 antdv-next 的现代化中后台前端脚手架，内置 RBAC 权限、动态路由、主题系统、国际化、Mock 数据、Pro 组件和常见业务示例。

[![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 预览

在线体验: [https://antdv-next-admin.yelog.org/dashboard](https://antdv-next-admin.yelog.org/dashboard)

![系统截图](docs/images/screenshot.png)

默认账号:

```text
管理员: admin / 123456
普通用户: user / 123456
```

## 快速开始

```bash
npm install
npm run dev
```

开发服务默认运行在 `http://localhost:3000`。

常用验证命令:

```bash
npm run lint             # oxlint src mock
npm run format:check     # oxfmt --check src mock
npm run type-check       # vue-tsc --noEmit
npm run test:unit:run    # Vitest one-shot
npm run build            # 仅生产构建
npm run build:check      # 类型检查 + 生产构建
npm run preview          # 预览生产构建
```

发布或提交前建议执行:

```bash
npm run lint && npm run format:check && npm run type-check && npm run test:unit:run && npm run build:check
```

## 技术栈

- 核心框架: Vue 3.5、TypeScript 6、Vite 8、Pinia 3、Vue Router 5、vue-i18n 11
- UI 与图标: antdv-next、@antdv-next/icons、Iconify
- 样式体系: CSS Variables、Tailwind CSS 4、SCSS
- 数据与 Mock: Axios、vite-plugin-mock-dev-server、@faker-js/faker
- 编辑器: TipTap、Milkdown、CodeMirror
- 图表: ECharts、vue-echarts
- 工程化: vue-tsc、Vitest、oxlint、oxfmt

## 架构概览

核心执行链路:

```text
src/main.ts
  -> 注册 Pinia / Router / i18n / directives / 全局组件默认属性

src/router/routes.ts
  -> staticRoutes / basicRoutes / asyncRoutes

src/router/guards.ts
  -> 登录态校验 / 动态路由注入 / 字典预加载 / Tabs 初始化

src/stores/permission.ts
  -> 根据角色与权限过滤 asyncRoutes 并生成菜单

src/utils/request.ts
  -> Axios 封装 / Token 注入 / 401 refresh / 错误跳转
```

关键目录:

```text
src/api/                  # 业务 API 封装
src/assets/styles/        # 全局样式、主题变量、动画、Tailwind 入口
src/components/Layout/    # 后台主布局、菜单、顶部栏、Tabs、设置抽屉
src/components/Pro/       # 配置化 Pro 组件
src/components/Captcha/   # 滑块、旋转、拼图、点选验证码统一导出
src/composables/          # 权限、水印、全屏等组合式函数
src/constants/            # 权限码等常量
src/directives/           # 自定义指令，包括 v-permission
src/locales/              # zh-CN / en-US / ja-JP / ko-KR 国际化资源
src/router/               # 路由表、守卫、权限过滤工具
src/stores/               # 按领域拆分的 Pinia stores
src/types/                # API、路由、Pro 组件等共享类型
src/utils/                # 请求、存储、i18n、图标等工具
src/views/                # 页面与示例
mock/data/                # Mock 数据源
mock/handlers/            # Mock 接口处理器
tests/unit/               # Vitest 单元测试
tests/e2e/                # Playwright starter，依赖未安装
```

## 功能矩阵

| 能力 | 说明 |
| --- | --- |
| 权限系统 | RBAC、动态路由、按钮权限、`v-permission` 指令、`usePermission()` 组合式函数、`PermissionButton` 组件 |
| 路由系统 | 静态路由、基础登录路由、权限动态路由、404 动态路由恢复 |
| 布局系统 | 垂直/水平布局、响应式侧边栏、面包屑、多标签页、右键菜单、全局搜索 |
| 主题系统 | 亮色、暗色、跟随系统、6 种主题色、灰色模式、色弱模式、CSS Variables 驱动 |
| 国际化 | 支持 `zh-CN`、`en-US`、`ja-JP`、`ko-KR`，非默认语言按需异步加载 |
| Mock 数据 | 覆盖认证、用户、角色、权限、部门、字典、配置、文件、日志、Dashboard 等模块 |
| 内容编辑 | TipTap 富文本、Milkdown Markdown、CodeMirror 代码编辑器 |
| 示例体系 | ProTable、复杂表单、主从表、虚拟表格、JSON 输入、i18n 输入、高级筛选、导入导出、请求鉴权、RBAC、可观测性、测试示例等 |
| 工程质量 | strict TypeScript、Vitest、oxlint、oxfmt、vue-tsc、生产构建检查 |

## Pro 组件

`src/components/Pro/` 提供以下配置化组件:

| 组件 | 定位 |
| --- | --- |
| ProTable | 配置化表格，支持请求、搜索、分页、工具栏、列设置、表头过滤、列宽调整、权限动作 |
| ProForm | 配置化表单，支持网格布局、校验、动态选项和自定义渲染 |
| ProModal | 增强弹窗，支持拖拽、全屏和表单集成 |
| ProDescriptions | 配置化描述列表 |
| ProDetail | 详情页布局和 Tabs |
| ProChart | ECharts 图表封装 |
| ProStatCard | 统计卡片 |
| ProStepForm | 分步表单 |
| ProSplitLayout | 分栏布局 |
| ProUpload | 上传组件封装 |
| ProStatus | dot/tag/badge 状态展示 |
| ProCodeEditor | CodeMirror 代码编辑器 |

ProTable 请求函数需要返回 `ProTableRequestResult`:

```ts
import type {
  ProTableColumn,
  ProTableRequestParams,
  ProTableRequestResult,
} from "@/types/pro";

interface UserRecord {
  id: number;
  name: string;
  status: "active" | "disabled";
  createdAt: string;
}

const columns: ProTableColumn<UserRecord>[] = [
  { title: "姓名", dataIndex: "name", valueType: "text", search: true },
  { title: "状态", dataIndex: "status", valueType: "tag" },
  { title: "创建时间", dataIndex: "createdAt", valueType: "date" },
];

async function loadData(
  params: ProTableRequestParams,
): Promise<ProTableRequestResult<UserRecord>> {
  console.log(params);
  return { data: [], total: 0, success: true };
}
```

## 权限用法

权限码集中维护在 `src/constants/permissions.ts`，路由 `meta.requiredPermissions`、按钮权限和业务判断应优先复用常量，避免散落字符串。

模板指令:

```vue
<a-button v-permission="'user.create'">创建用户</a-button>
<a-button v-permission="['user.edit', 'user.delete']">操作</a-button>
<a-button v-permission.all="['user.edit', 'user.approve']">审批</a-button>
```

组合式函数:

```ts
const { can, canAll, hasRole } = usePermission();

if (can("user.create")) {
  // 有创建权限
}

if (canAll(["user.edit", "user.approve"])) {
  // 同时拥有编辑和审批权限
}

if (hasRole("admin")) {
  // 管理员角色
}
```

组件方式:

```vue
<PermissionButton permission="user.create">
  <a-button>创建用户</a-button>
</PermissionButton>
```

## 环境变量与后端接入

开发环境默认启用 Vite Mock 服务:

```bash
VITE_USE_MOCK=true
VITE_API_BASE_URL=/api
```

生产构建默认用于静态 Demo，因此启用浏览器端 Mock，并保持 `/api` 前缀:

```bash
VITE_USE_MOCK=true
VITE_API_BASE_URL=/api
```

接入真实后端时，改为:

```bash
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://your-api-domain.com/api
```

接口响应建议遵循:

```ts
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}
```

`src/utils/request.ts` 的 Axios 响应拦截器会返回 `response.data`，并将 `{ code !== 200 }` 视为错误。业务 API 方法应按调用方实际消费的数据结构声明类型。

## Mock 数据

开发环境通过 `vite-plugin-mock-dev-server` 提供 `/api` 前缀的 Mock 接口。静态 Demo 模式下通过浏览器端 Mock 拦截 `/api` 请求，避免 GitHub Pages 等静态站点请求不存在的后端接口。

已覆盖模块:

- 认证: `/api/auth/login`、`/api/auth/logout`、`/api/auth/info`、`/api/auth/refresh`
- 用户: `/api/users`、`/api/users/:id`、`/api/users/batch`、`/api/users/change-password`
- 角色: `/api/roles`
- 权限: `/api/permissions`、`/api/permissions/tree`、`/api/permissions/user`
- 部门: `/api/dept/tree`、`/api/dept/list`、`/api/dept`
- 字典: `/api/dict/types`、`/api/dict/type/list`、`/api/dict/data/list`、`/api/dict/data/:typeCode`
- 配置: `/api/config/list`、`/api/config/key/:key`、`/api/config`
- 文件: `/api/file/list`、`/api/file/:id`、`/api/file/upload`
- 日志: `/api/log/operation/list`、`/api/log/login/list`
- Dashboard: `/api/dashboard/stats`、`/api/dashboard/sales-trend`、`/api/dashboard/user-distribution`、`/api/dashboard/activities`、`/api/dashboard/chart-data`

新增 Mock 接口时通常需要同时新增:

```text
mock/data/[entity].data.ts
mock/handlers/[entity].mock.ts
src/api/[entity].ts
src/types/[entity].ts
```

## 测试

单元测试使用 Vitest，配置在 `vitest.config.ts`:

```bash
npm run test:unit       # watch mode
npm run test:unit:run   # one-shot
```

当前单测覆盖路由权限过滤、ProTable 请求、搜索、表头过滤和关键词搜索等逻辑。

`tests/e2e/*.spec.ts` 是 Playwright starter，当前项目未安装 Playwright 依赖；如需启用 E2E，需要先补齐依赖、脚本和运行环境。

## 开发约定

- TypeScript 开启 `strict`、`noUnusedLocals` 和 `noUnusedParameters`，不要用无意义的死参数或类型压制掩盖问题。
- 路径别名 `@/` 指向 `src/`。
- 可复用 Vue 组件使用 PascalCase 文件名；路由页面按目录组织，入口通常为 `index.vue`。
- Vue 组件使用 Composition API 和 `<script setup lang="ts">`。
- Pinia Store 使用 setup 语法，并按领域拆分。
- 主题相关样式优先使用 `src/assets/styles/variables.css` 中的 CSS Variables；SCSS 和 Tailwind 可用于局部样式与工具类。
- Antdv 组件通过 `unplugin-vue-components` 和 `AntdvNextResolver` 自动导入，但 `Select`、`DatePicker`、`DateRangePicker` 被排除，相关封装或使用需注意显式处理。
- 全局默认组件属性在 `src/components/Global/defaultComponentProps.ts` 注册，修改基础表单控件行为前应先检查这里。
- 登录态、语言、主题、Tabs 等状态会持久化到 localStorage；调试权限、路由或菜单问题时可清理本地存储后重新登录。
- 修改 `asyncRoutes`、权限码或角色权限后，建议退出登录或刷新会话再验证，避免旧的动态路由和 Tabs 缓存影响判断。

## 模块划分

- 组织管理: 部门、用户、角色、权限
- 系统管理: 配置、字典、文件、日志
- 示例中心: 快速开始、表单输入、内容编辑、基础交互、业务脚手架、安全工程、集成导航、异常页

## 许可证

MIT License

## 致谢

- [Vue 3](https://vuejs.org/)
- [Vite](https://vite.dev/)
- [Ant Design Vue](https://antdv.com/)
- [Antdv Next](https://github.com/antdv-next/antdv-next)
- [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)
- [Ant Design Pro Vue](https://pro.antdv.com/)
