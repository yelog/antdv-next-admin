# 复杂表单进度条主题色设计

## 问题

`ProStepForm` 的百分比文字使用项目 CSS 变量 `--color-primary`，但 `a-progress` 没有指定 `stroke-color`。Antdv Next 1.3.3 的 Progress 组件默认轨道色来自 `colorInfo`，进度达到 100% 时还会自动使用 `colorSuccess`，因此轨道颜色不会稳定跟随应用主题色。

## 方案

在通用 `ProStepForm` 内为进度条显式传入 `stroke-color="var(--color-primary)"`。项目在预设主题和自定义主题切换时都会更新该 CSS 变量，浏览器可立即重新计算内联颜色；修改仅影响步骤表单，不改变其他 Progress 的信息、成功或异常语义。

## 验证

- 运行现有步骤进度计算单测，确保步骤百分比逻辑不受影响。
- 运行类型检查、lint、格式检查和生产构建。
- 检查最终 diff，确认未修改工作区中已有的无关变更。
