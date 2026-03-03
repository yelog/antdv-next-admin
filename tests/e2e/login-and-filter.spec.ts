import { test, expect } from '@playwright/test'

test.describe('Login and Basic Navigation', () => {
  test('should login with admin credentials', async ({ page }) => {
    await page.goto('/login')

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Wait for login form inputs to be visible (using name attribute)
    const usernameInput = page
      .locator('input[name="username"]')
      .or(page.locator('input[placeholder*="用户名"]'))
      .or(page.locator('input[placeholder*="username"]'))
    const passwordInput = page
      .locator('input[name="password"]')
      .or(page.locator('input[type="password"]'))
    const loginButton = page
      .locator('button[type="submit"]')
      .or(page.locator('button:has-text("登录")'))
      .or(page.locator('button:has-text("Login")'))

    // Wait for elements to be ready
    await expect(usernameInput).toBeVisible({ timeout: 10000 })
    await expect(passwordInput).toBeVisible({ timeout: 10000 })
    await expect(loginButton).toBeVisible({ timeout: 10000 })

    // Fill credentials
    await usernameInput.fill('admin')
    await passwordInput.fill('123456')

    // Complete captcha if exists (simulate slider drag)
    const captcha = page.locator('.slider-captcha').or(page.locator('[class*="captcha"]'))
    if (await captcha.isVisible().catch(() => false)) {
      // For testing, we might need to skip captcha or mock it
      // This is a simplified approach - in real scenarios, captcha might need special handling
      const slider = page.locator('.slider-handle')
      const sliderBox = await slider.boundingBox()
      const trackBox = await page.locator('.slider-bg').boundingBox()
      if (sliderBox && trackBox) {
        await slider.dragTo(page.locator('.slider-bg'), {
          targetPosition: { x: trackBox.width - sliderBox.width - 5, y: trackBox.height / 2 }
        })
      }
    }

    // Click login button
    await loginButton.click()

    // Should redirect to dashboard (with increased timeout for CI)
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 })
  })

  test('should login with user credentials', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const usernameInput = page
      .locator('input[name="username"]')
      .or(page.locator('input[placeholder*="用户名"]'))
      .or(page.locator('input[placeholder*="username"]'))
    const passwordInput = page
      .locator('input[name="password"]')
      .or(page.locator('input[type="password"]'))
    const loginButton = page
      .locator('button[type="submit"]')
      .or(page.locator('button:has-text("登录")'))
      .or(page.locator('button:has-text("Login")'))

    await expect(usernameInput).toBeVisible({ timeout: 10000 })
    await expect(passwordInput).toBeVisible({ timeout: 10000 })

    await usernameInput.fill('user')
    await passwordInput.fill('123456')
    await loginButton.click()

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 })
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const usernameInput = page
      .locator('input[name="username"]')
      .or(page.locator('input[placeholder*="用户名"]'))
      .or(page.locator('input[placeholder*="username"]'))
    const passwordInput = page
      .locator('input[name="password"]')
      .or(page.locator('input[type="password"]'))
    const loginButton = page
      .locator('button[type="submit"]')
      .or(page.locator('button:has-text("登录")'))
      .or(page.locator('button:has-text("Login")'))

    await expect(usernameInput).toBeVisible({ timeout: 10000 })

    await usernameInput.fill('invalid')
    await passwordInput.fill('invalid')
    await loginButton.click()

    // Should show error message (wait for it with increased timeout)
    await expect(
      page.locator('.ant-message-error, .ant-alert-error, .ant-notification-notice').first()
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Table Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const usernameInput = page
      .locator('input[name="username"]')
      .or(page.locator('input[placeholder*="用户名"]'))
      .or(page.locator('input[placeholder*="username"]'))
    const passwordInput = page
      .locator('input[name="password"]')
      .or(page.locator('input[type="password"]'))
    const loginButton = page
      .locator('button[type="submit"]')
      .or(page.locator('button:has-text("登录")'))
      .or(page.locator('button:has-text("Login")'))

    await expect(usernameInput).toBeVisible({ timeout: 10000 })

    await usernameInput.fill('admin')
    await passwordInput.fill('123456')
    await loginButton.click()

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 })
  })

  test('should navigate to user management', async ({ page }) => {
    await page.goto('/organization/user')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Should show user list (using URL or table presence)
    await expect(
      page.locator('table').or(page.locator('text=用户管理')).or(page.locator('text=User'))
    ).toBeVisible({ timeout: 10000 })
  })

  test('should search in table', async ({ page }) => {
    await page.goto('/examples/table')
    await page.waitForLoadState('networkidle')

    // Wait for table to load
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 })

    // Search for admin
    const searchInput = page.locator('input[type="text"]').first()
    await searchInput.fill('admin')

    // Press enter or click search
    await searchInput.press('Enter')

    // Should filter results
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 10000 })
  })
})
