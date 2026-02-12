<template>
  <div class="page-container">
    <div class="card mb-lg">
      <h2>测试示例</h2>
      <p class="text-secondary">提供单测与 e2e 的推荐模板，直接复制即可用于新模块。</p>

      <a-alert
        type="info"
        show-icon
        message="当前仓库尚未安装 Vitest / Playwright 依赖，此页提供结构与样例。"
      />
    </div>

    <div class="card mb-lg">
      <div class="section-title">单元测试模板（Vitest）</div>
      <pre class="code-block"><code>{{ unitCode }}</code></pre>
    </div>

    <div class="card mb-lg">
      <div class="section-title">端到端测试模板（Playwright）</div>
      <pre class="code-block"><code>{{ e2eCode }}</code></pre>
    </div>

    <div class="card">
      <div class="section-title">落地顺序建议</div>
      <a-steps direction="vertical" size="small">
        <a-step title="先补单测" description="先覆盖核心函数、store 计算逻辑和边界条件。" />
        <a-step title="再补 e2e" description="覆盖登录、搜索、列表操作等关键用户路径。" />
        <a-step title="接入 CI" description="将 type-check + unit + e2e 串成流水线，合并前自动执行。" />
      </a-steps>
    </div>
  </div>
</template>

<script setup lang="ts">
const unitCode = `import { describe, expect, it } from 'vitest'

function splitKeywords(keyword: string) {
  return keyword.trim().toLowerCase().split(/\\s+/).filter(Boolean)
}

describe('splitKeywords', () => {
  it('should split by whitespace', () => {
    expect(splitKeywords('  foo   bar  ')).toEqual(['foo', 'bar'])
  })

  it('should return empty array for empty input', () => {
    expect(splitKeywords('   ')).toEqual([])
  })
})`

const e2eCode = `import { test, expect } from '@playwright/test'

test('login and filter users by keyword', async ({ page }) => {
  await page.goto('/login')

  await page.getByPlaceholder('请输入用户名').fill('admin')
  await page.getByPlaceholder('请输入密码').fill('123456')
  await page.getByRole('button', { name: '登录' }).click()

  await page.goto('/examples/table')
  await page.getByRole('columnheader', { name: '用户名' }).click()

  await page.getByPlaceholder(/搜索/).fill('admin')
  await page.getByRole('button', { name: '搜索' }).click()

  await expect(page.locator('table')).toContainText('admin')
})`
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-weight: var(--font-weight-semibold);
  margin-bottom: 10px;
}

.code-block {
  background: var(--color-bg-layout);
  border: 1px solid var(--color-border-secondary);
  border-radius: 10px;
  padding: 12px;
  overflow-x: auto;

  code {
    font-family: var(--font-family-code);
    font-size: 12px;
    line-height: 1.6;
    white-space: pre;
  }
}
</style>
