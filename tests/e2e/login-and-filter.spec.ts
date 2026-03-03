import { test, expect } from '@playwright/test'

test.describe('Login and Basic Navigation', () => {
  test('should login with admin credentials', async ({ page }) => {
    await page.goto('/login')

    // Wait for login form
    await expect(page.locator('input[placeholder*="用户名"]')).toBeVisible()

    // Fill credentials
    await page.locator('input[placeholder*="用户名"]').fill('admin')
    await page.locator('input[placeholder*="密码"]').fill('123456')

    // Click login button
    await page.locator('button:has-text("登录")').click()

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/)

    // Verify dashboard content
    await expect(page.locator('text=Dashboard').first()).toBeVisible()
  })

  test('should login with user credentials', async ({ page }) => {
    await page.goto('/login')

    await page.locator('input[placeholder*="用户名"]').fill('user')
    await page.locator('input[placeholder*="密码"]').fill('123456')
    await page.locator('button:has-text("登录")').click()

    await expect(page).toHaveURL(/.*dashboard/)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.locator('input[placeholder*="用户名"]').fill('invalid')
    await page.locator('input[placeholder*="密码"]').fill('invalid')
    await page.locator('button:has-text("登录")').click()

    // Should show error message
    await expect(page.locator('.ant-message-error, .ant-alert-error').first()).toBeVisible()
  })
})

test.describe('Table Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.locator('input[placeholder*="用户名"]').fill('admin')
    await page.locator('input[placeholder*="密码"]').fill('123456')
    await page.locator('button:has-text("登录")').click()
    await expect(page).toHaveURL(/.*dashboard/)
  })

  test('should navigate to user management', async ({ page }) => {
    await page.goto('/organization/user')

    // Should show user list
    await expect(page.locator('text=用户管理').first()).toBeVisible()
  })

  test('should search in table', async ({ page }) => {
    await page.goto('/examples/table')

    // Wait for table to load
    await expect(page.locator('table')).toBeVisible()

    // Search for admin
    const searchInput = page.locator('input[type="text"]').first()
    await searchInput.fill('admin')

    // Press enter or click search
    await searchInput.press('Enter')

    // Should filter results
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })
})
