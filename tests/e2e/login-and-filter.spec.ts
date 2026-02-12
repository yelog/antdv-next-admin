/**
 * E2E test template for login + table filtering.
 *
 * Note:
 * - This repository currently does not install Playwright dependencies.
 * - Keep this file as a starter for future test setup.
 */
import { test, expect } from '@playwright/test'

test('login and filter users', async ({ page }) => {
  await page.goto('/login')

  await page.getByPlaceholder('请输入用户名').fill('admin')
  await page.getByPlaceholder('请输入密码').fill('123456')
  await page.getByRole('button', { name: '登录' }).click()

  await page.goto('/examples/table')
  await page.getByRole('columnheader', { name: '用户名' }).click()
  await page.getByPlaceholder(/搜索/).fill('admin')
  await page.getByRole('button', { name: '搜索' }).click()

  await expect(page.locator('table')).toContainText('admin')
})
