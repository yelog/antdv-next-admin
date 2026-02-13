<template>
  <div class="page-container">
    <div class="card mb-lg">
      <h2>{{ $t('examples.scaffold.testing.title') }}</h2>
      <p class="text-secondary">{{ $t('examples.scaffold.testing.description') }}</p>

      <a-alert
        type="info"
        show-icon
        :message="$t('examples.scaffold.testing.alertMessage')"
      />
    </div>

    <div class="card mb-lg">
      <div class="section-title">{{ $t('examples.scaffold.testing.unitTestTitle') }}</div>
      <pre class="code-block"><code>{{ unitCode }}</code></pre>
    </div>

    <div class="card mb-lg">
      <div class="section-title">{{ $t('examples.scaffold.testing.e2eTestTitle') }}</div>
      <pre class="code-block"><code>{{ e2eCode }}</code></pre>
    </div>

    <div class="card">
      <div class="section-title">{{ $t('examples.scaffold.testing.implementationTitle') }}</div>
      <a-steps direction="vertical" size="small">
        <a-step :title="$t('examples.scaffold.testing.step1Title')" :description="$t('examples.scaffold.testing.step1Description')" />
        <a-step :title="$t('examples.scaffold.testing.step2Title')" :description="$t('examples.scaffold.testing.step2Description')" />
        <a-step :title="$t('examples.scaffold.testing.step3Title')" :description="$t('examples.scaffold.testing.step3Description')" />
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
