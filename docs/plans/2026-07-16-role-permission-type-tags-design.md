# 角色权限类别标签设计

## 目标

在角色编辑弹窗展开后的权限树节点中显示权限类别标签，让用户能快速区分菜单、按钮和 API 权限，同时保持选中区域、搜索、回显和提交行为不变。

## 架构判断

- Antdv Next TreeSelect 原生提供 `treeTitleRender(nodeData)`，适合只定制下拉树节点内容。
- ProForm 已通过 `item.props` 透传 TreeSelect 原生属性，无需增加权限业务专用 API。
- 权限类别属于角色管理页面的领域展示语义，不应进入公共 ProForm 或 `ProFormOption` 契约。
- TreeSelect 数据继续保留字符串 `title`，保证本地搜索、选中标签和远程选项适配不受 VNode 影响。

## 展示规则

- 菜单权限使用蓝色 Tag，文案复用 `permission.menu`。
- 按钮权限使用绿色 Tag，文案复用 `permission.button`。
- API 权限使用紫色 Tag，文案复用 `permission.api`。
- Tag 只显示在展开后的权限树节点中；选中后的输入框标签保持紧凑的纯文本形式。
- 节点标题保持“权限名称（权限代码）”，类别 Tag 位于标题末尾。

## 数据流

1. 权限树 API 返回 `Permission[]`。
2. 现有 `permissionMap` 按权限 ID 保存完整权限对象。
3. TreeSelect 调用页面提供的 `treeTitleRender`。
4. 渲染函数通过节点 `value` 查询权限类型，并生成文本标题和类别 Tag。
5. 找不到权限对象时回退为原始节点标题，避免异步或异常数据产生空节点。

## 边界

- 不修改公共 TreeSelect 渲染器、搜索逻辑或 `ProFormOption.label` 类型。
- 不把类别 Tag 渲染到选中区域，避免多选输入框拥挤。
- 不改变权限 ID、父子勾选关系、`SHOW_PARENT` 策略或提交载荷。
- 颜色是辅助信息，类别仍通过可见文本表达，不依赖颜色传递唯一语义。

## 验证

- 单元测试覆盖 menu/button/api 的文案键和颜色，以及未知类别回退。
- 运行定向测试、全量单测、type-check、lint 和 build:check。
- 浏览器验证权限树节点包含彩色类别 Tag，选中区域保持原样，搜索仍可按名称和代码匹配。
