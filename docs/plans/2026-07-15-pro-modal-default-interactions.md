# ProModal 默认交互修复实施计划

**目标：** 恢复 ProTable 新增/编辑弹窗的默认靠上定位、关闭图标、遮罩和 Esc 关闭能力。

**架构：** 在 `ProModal` 这一公共封装层修复默认契约，避免 ProTable、ProFormModal 和各业务页面分别补丁。普通模式保持水平居中、垂直靠上；仅在显式 `centered` 时垂直居中。所有取消来源统一同步 `open=false`。

**技术栈：** Vue 3、TypeScript、Antdv Next Modal、SCSS、Vitest。

---

### 任务 1：锁定 Modal 默认契约

**文件：**
- 新增：`tests/unit/pro-modal-contract.spec.ts`
- 新增：`src/components/Pro/ProModal/modalContract.ts`

1. 为 `closable`、`mask`、`keyboard` 和 `centered` 的默认值编写失败测试。
2. 运行 `npx vitest run tests/unit/pro-modal-contract.spec.ts` 确认测试失败。
3. 实现默认契约常量。
4. 重跑定向测试确认通过。

### 任务 2：修复 ProModal 定位和关闭链路

**文件：**
- 修改：`src/components/Pro/ProModal/index.vue`

1. 将默认契约应用到 `withDefaults`。
2. 为显式垂直居中增加独立 wrapper class。
3. 普通 wrapper 改为顶部对齐并恢复合理顶部间距。
4. 让 Esc、蒙版和取消按钮触发的 `cancel` 同步发出 `update:open=false`。
5. 保留拖拽、缩放和全屏后的固定定位逻辑。

### 任务 3：验证

1. 运行 `npx vitest run tests/unit/pro-modal-contract.spec.ts`。
2. 运行 `npm run type-check`。
3. 运行 `npm run lint`。
4. 运行 `npm run build`。
5. 运行 `git diff --check` 并确认未改动用户现有 ProForm 工作。
