# ProTable 搜索列数交付设计

## 目标

把 `search.columnsPerRow` 从内部已有但难以发现的配置，完善为脚手架中可全局设定、可单表覆盖、可动态体验且文档完整的正式能力。

## 架构

- ProForm 的响应式布局改用 CSS Grid，准确支持任意正整数列数，避免 24 栅格无法表达 5 列的问题。
- `gutter` 保持原有水平间距语义，CSS Grid 不额外增加行间距；纵向节奏继续由 FormItem 控制。
- 配置优先级为：组件内置响应式默认值、`appDefaultSettings.proTable.search.columnsPerRow`、单个 ProTable 的 `search.columnsPerRow`。
- 全局配置属于开发期脚手架设置，不进入最终用户偏好设置或持久化状态。
- ProTable Advanced 示例提供 2、3、4、5 列本地即时切换，并展示当前等价配置。
- VitePress 文档说明 API、默认值、响应式写法和配置优先级；真实交互留在主应用示例，避免维护第二套 ProTable。

## 行为边界

- 固定数字在 `xs` 仍回落为 1 列，避免移动端拥挤。
- 响应式对象允许分别设置 `xs/sm/md/lg/xl`，缺失断点沿用默认值并向更大断点继承显式值。
- `collapsedRows` 继续根据当前断点实际列数计算可见字段，并为同行操作区保留位置。
- 示例控制只影响当前页面，不写入本地存储。

## 验证

- 单元测试覆盖 2/3/4/5 列、断点回退和折叠数量。
- 主应用执行 type-check、lint、单测和 build:check。
- 文档执行 docs:check 和 build。
- 浏览器验证动态切换、展开收起及 5 列真实布局。
