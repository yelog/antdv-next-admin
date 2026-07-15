# 远程 Select 与 TreeSelect 示例设计

## 背景

当前《表单示例》只展示静态选项。Antdv Next 的 Select 支持通过搜索事件和受控 options 实现远程搜索；TreeSelect 同时支持节点展开时异步加载，以及通过受控搜索自行加载远程树数据。

## 目标

在现有《表单示例》的 ProForm 中增加三个真实字段，稳定展示以下三种交互：

1. Select 输入关键词后远程搜索。
2. TreeSelect 展开父节点时异步加载子节点。
3. TreeSelect 输入关键词后远程搜索并替换树数据。

## 方案

示例复用 ProForm 已有的 `searchMode: 'remote'`、`remoteSearch` 和透传 `props` 契约，不新增另一套搜索实现。远程 Select 和远程搜索 TreeSelect 通过 `remoteSearch` 提供选项，异步展开 TreeSelect 通过响应式 `options` 与 `props.loadData` 加载子节点。

远程请求使用页面内的本地模拟数据和延迟 Promise，不依赖公网服务。Select 与远程搜索 TreeSelect 使用防抖，并通过递增请求编号忽略过期响应。异步展开 TreeSelect 使用 `loadData` 追加子节点，并防止重复加载。

三个示例直接加入现有 `formItems`，与其他字段共享 ProForm 的布局、提交和重置流程。所有可见文案加入中、英、日、韩四种语言资源。

## 状态与异常处理

- 搜索为空时清空远程结果，避免展示与当前输入不匹配的旧数据。
- 请求中显示组件 loading 或下拉空内容中的 Spin。
- 无结果时显示明确的空状态文案。
- 后到的旧请求不得覆盖最新搜索结果。
- 本地模拟请求不主动制造失败；接口结构保留异步边界，便于读者替换为真实 API。

## 验证

- 检查三种交互的加载、结果、空状态及重复展开行为。
- 执行 touched-files 格式检查、lint、类型检查、单元测试和生产构建。
- 如开发服务器可用，进行页面浏览器验证并检查控制台警告。
