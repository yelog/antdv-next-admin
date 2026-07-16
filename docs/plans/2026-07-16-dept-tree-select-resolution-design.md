# Department TreeSelect Resolution Design

## Problem

部门管理弹窗使用 `<a-tree-select>`，但当前自动导入链路没有生成对应的 `TreeSelect` 组件导入。Vue 在运行时只能把该标签当作未解析组件，并输出 `Failed to resolve component: a-tree-select`。

## Decision

在部门页从 `antdv-next` 显式导入 `TreeSelect`，并把模板标签改为 `<TreeSelect>`。修复限定在真实使用组件的页面，不修改全局 resolver，也不把 TreeSelect 注册成全局组件。

## Verification

- 对目标文件执行格式检查。
- 执行类型检查、lint、单元测试与生产构建。
- 浏览器访问部门管理并打开新增/编辑弹窗，确认 TreeSelect 正常渲染且控制台不再出现组件解析告警。
