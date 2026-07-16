# 路由菜单图标统一设计

## 背景

路由 `meta.icon` 会被完整传入菜单树，但菜单布局通过静态 `iconMap` 解析图标，只支持少量 Antdv 图标。与此同时，权限菜单中的 `IconPicker` 支持全部 Antdv 图标、Iconify 和本地 SVG，导致“能选择、能保存、不能显示”。

## 设计

所有消费路由图标的布局统一渲染现有 `Icon` 组件，不再维护菜单专用白名单。图标协议兼容：

- 裸 Antdv 名称：`DashboardOutlined`
- 带前缀 Antdv 名称：`antdv-next:DashboardOutlined`、`antd:DashboardOutlined`
- Iconify：`ri:home-line`、`mdi:account`、`iconify:ion:apps-outline`
- 本地 SVG：`svg:custom-icon`

裸名称仅在以 `Outlined`、`Filled` 或 `TwoTone` 结尾时识别为 Antdv 图标，其他名称继续按 Iconify 处理。空值和格式无效值不创建菜单图标节点。

## 影响范围

统一覆盖侧边栏、横向菜单、标签页、全局搜索和递归菜单项。路由结构、权限过滤和后端字段不变，现有路由配置无需迁移。

## 验证

为图标分类和菜单图标节点生成补充单元测试，并执行单测、类型检查、lint、格式检查和生产构建。
