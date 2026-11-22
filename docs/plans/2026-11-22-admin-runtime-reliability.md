# 后台运行可靠性实施计划

**目标**　让会话续期、表格查询、页签缓存和在线 Demo 的行为可预测，并守住登录入口的加载体积。

**实现路径**　沿用 Axios、Pinia 和 Vue Router 的现有入口，在发生问题的状态边界集中修复。Vitest 覆盖错误和并发顺序，Playwright 从实际登录页进入 Demo 验证表格和页签，产物检查根据实际模块依赖识别图表库。

## 1. 统一会话失效处理

- 修改 `src/utils/request.ts`、`src/stores/auth.ts` 和 `tests/unit/request-service.spec.ts`。
- 先用自定义 Axios adapter 分别返回 HTTP `401` 与 HTTP `200` 加业务码 `401`，验证两种响应都应续期，并让两个并发请求共享同一次续期。
- 让两个拦截器分支调用同一处理函数。记录原请求是否已重试，续期后使用新令牌重放一次。允许较晚返回的同批请求使用刚换发的令牌。
- 续期失败或重试仍返回当前会话的 `401` 时清理登录态、权限和页签，按请求选项决定是否提示和跳转。公开请求、续期接口和旧会话的请求单独拒绝。续期完成时核对发起续期的会话仍有效。
- 执行 `npm run test:unit:run -- tests/unit/request-service.spec.ts`，验收并发、迟到响应、续期失败、重试上限和公开接口。

## 2. 约束 ProTable 的异步查询

- 修改 `src/components/Pro/ProTable/index.vue`、`src/components/Pro/ProTable/composables/useProTableRequest.ts` 和 `tests/unit/pro-table-request.spec.ts`。
- 用可控 Promise 模拟两次分页查询，让第 2 页先返回、第 1 页后返回。再覆盖旧请求先结束时的加载状态与错误提示。
- 每次查询开始时生成新序号。只有当前序号可以提交行数据、总数、提示和加载状态。卸载表格或替换请求函数时让正在等待的结果失效。
- 执行 `npm run test:unit:run -- tests/unit/pro-table-request.spec.ts`，确认倒序完成和失效场景。

## 3. 让页签与页面实例对应

- 修改 `src/router/routes.ts` 并新增 `src/router/tabPages.ts`。角色、用户等具名叶子路由加载页面时采用同名组件，让 `KeepAlive.include` 能正确匹配。
- 示例分组使用 Vue Router 的无组件父路由，保留目录、菜单和权限层级，让真正的页面进入后台布局的缓存出口。给仪表盘计时器补齐页签停用与恢复的生命周期。
- 验证用户页筛选后切去仪表盘再返回，页面保留条件与结果。关闭页签后从菜单再次进入，页面恢复默认状态。另验证多级示例页和现有权限过滤。

## 4. 修复在线 Demo 的列表和写入

- 修改 `src/mock/browser.ts` 并扩展 `tests/unit/browser-mock.spec.ts`。通过 Axios `getUri` 合并 URL 查询串和 `params`，供分页、筛选与兜底响应共用。
- 每次安装浏览器 Mock 时复制种子数据。用户、角色、部门、权限、字典、配置及其他已实现写操作的列表与写入读取各自的同一份内存状态。返回实体快照，刷新页面后恢复演示种子。
- 先验证实际请求形态 `GET /users` 配 `params: { current: 2, pageSize: 1 }`，再验证新增后按 ID 可查询、编辑后列表可见、删除后查无此项及不同实例间的数据隔离。
- 执行 `npm run test:unit:run -- tests/unit/browser-mock.spec.ts`，再用 E2E 验证实际用户页搜索。

## 5. 移除入口图表依赖并运行浏览器回归

- 修改 `vite.config.ts` 采用默认分包。新增 `tests/build/login-bundle.test.mjs`，通过 Vite 的生产构建结果遍历入口和登录页的静态导入，检查 ECharts 模块不在静态依赖内，同时确认图表页仍包含图表依赖。
- 将 `tests/e2e/login-and-filter.spec.ts` 接入 Playwright 和 `playwright.config.ts`。启动静态 Demo 构建产物，从公开演示账号和滑块进行正常登录，执行用户筛选、切换页签和关闭后重开。使用独立浏览器上下文覆盖普通用户菜单。
- 更新 `package.json`、两个锁文件、`README.md` 和构建工作流。运行 `npm run test:build` 与 `npm run test:e2e`，让 CI 执行同一套检查。
- 使用 Node.js 22 执行 `npm run type-check`、`npm run lint`、`npm run test:unit:run`、`npm run test:build`、`npm run test:e2e`、`npm run build` 和 `npm run build:demo`。记录入口 gzip 体积和仍需关注的现有告警。
