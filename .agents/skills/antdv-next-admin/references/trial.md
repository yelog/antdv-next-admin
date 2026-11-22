# 五人配对试用

1. 邀请 5 位近期维护过本项目的真实使用者，每人选一项近期做过的业务页或搜索改动。按下方题型保留真实输入结构和验收目标，把业务名、账号、地址和数据换成固定的合成值。给参与者编号 `U01` 至 `U05`，为每题留存脱敏题面、接口样例、初始数据、角色、预期结果和允许修改的文件。
2. 每人用同一题面在同一仓库版本的两份隔离副本各做一次。固定模型版本、工具权限、依赖、预置数据和时限，每次用新会话。对照副本在开跑前移出此 Skill 目录，启用副本加载 `antdv-next-admin`。按 `U01/U03/U05` 未启用→启用、`U02/U04` 启用→未启用运行，两次各自从初始状态开始。
3. 每轮首次交付立即冻结结果，由同一验收人按相同断言记通过或失败。记录随后实际人工修正到达标的分钟数，首次通过填 `0`，时限内未达标记为「未完成」并保留耗时。首次交付时用 `git diff --name-only HEAD` 和 `git ls-files --others --exclude-standard` 合并去重，扣除开跑前的差异，统计允许范围之外的文件数。新试验用例可放在预先约定的验收范围内。
4. 汇总两组的首次通过人数 `/5`、返工分钟数和无关文件数，保留逐人差值及未完成项。根据重复失败的断言修订 Skill 后，用原题复测。

## 题型 A · 从接口样例新增管理页

在 `/system/asset-alias` 新增设备别名管理。初始记录按 `id` 升序排列，每页 2 条。管理员可以增删改，验收用只读账号拥有 `system.assetAlias.view`，写入分别使用 `system.assetAlias.create`、`system.assetAlias.edit` 和 `system.assetAlias.delete`。

- `GET /api/asset-aliases` 接收从 1 开始的 `page`、`limit`、可选 `q` 和 `state`。`q` 按名称做不区分大小写的子串查询，`state` 取 `active` 或 `inactive`，先筛选再分页。
- `POST /api/asset-aliases`、`PUT /api/asset-aliases/:id` 接收 `{ name, state }`，`name` 必填，成功信封的 `data` 为保存后的记录。`DELETE /api/asset-aliases/:id` 成功时 `data` 为 `null`。
- 固定种子为 `a01 / alpha / active`、`a02 / beta / active`、`a03 / gamma / active`、`a04 / delta / inactive`。请求 `GET /api/asset-aliases?page=2&limit=2&state=active` 的响应如下。

```json
{
  "code": 200,
  "success": true,
  "message": "OK",
  "data": {
    "items": [{ "id": "a03", "name": "gamma", "state": "active" }],
    "count": 3
  }
}
```

**首次验收**要求开发和静态 Demo 均能访问。筛选启用项并翻到第二页，只有 `gamma` 且总数为 `3`，用 `q=zero-match` 得到空列表且总数为 `0`。清除筛选，创建启用状态的 `epsilon`、改为停用并删除，每步用名称查询确认结果。为两套 Mock 中的 `user` 测试身份补充该页读取权限，确认可访问且看不到写入操作。切换四语核对菜单、表单和反馈。允许改动新增业务 API、类型、页面、实际使用的权限与路由、四语、两套 Mock 及其固定测试数据。

## 题型 B · 只改用户列表搜索

在用户管理搜索中新增性别，排在状态、用户名和邮箱之前，沿用当前表头。允许改动 `src/views/system/user/index.vue`。两套 Mock 已有 `gender=male|female` 查询能力。

**首次验收**要求展开后看到性别、状态、用户名、邮箱的顺序，表头顺序与基线一致。以管理员登录，在开发和静态 Demo 中分别用 `user@example.com` 搭配 `female` 查询，首屏应只有 `user`、总数为 `1`。选择 `male` 后应无结果、总数为 `0`，重置后性别值从请求中省略并回到第一页。确认表单字段各自映射到既有 API 参数。

## 记录

每格填写「首次通过 / 人工返工分钟 / 无关文件数」，保留失败断言用于复测。

| 编号 | 脱敏任务编号 | 未启用 Skill | 启用 Skill | 失败断言 |
| --- | --- | --- | --- | --- |
| U01 | | | | |
| U02 | | | | |
| U03 | | | | |
| U04 | | | | |
| U05 | | | | |
