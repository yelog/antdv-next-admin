# 静态反馈组件主题同步设计

## 背景

应用根节点已经通过 `ConfigProvider` 和 `App` 提供响应式主题与语言，但系统页面仍大量使用 `Modal.confirm()` 静态方法。静态方法会创建独立 Vue 实例，无法继承根组件的 provide/inject 上下文，因此暗色模式下仍可能显示亮色确认框。

## 方案

在根组件中调用 `ConfigProvider.config({ holderRender })`，使用与页面根节点相同的 `antdThemeConfig` 和 `antdLocale` 包装静态反馈组件。通过 `watchEffect` 在主题或语言变化时刷新静态 holder 配置，使后续创建的 `Modal`、`message` 和 `notification` 静态实例使用最新上下文。

该方案保留现有页面中的 `import { Modal } from 'antdv-next'` 和 `Modal.confirm()`，避免为本次兼容性修复批量改动业务页面。

## 边界

- 新打开的静态反馈组件跟随当前主题和语言。
- 已经打开的静态确认框不保证在切换主题时原地换肤。
- 新代码仍可优先使用 `App.useApp()`；本配置作为遗留静态调用的全局兼容层。

## 验证

- TypeScript 类型检查。
- 单元测试与生产构建。
- 浏览器中分别在亮色和暗色模式打开系统设置删除确认框，检查背景和按钮主题。
