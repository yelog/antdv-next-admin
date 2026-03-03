import { test, expect } from '@playwright/test'

// Helper function to wait for login page to be ready
async function waitForLoginPage(page) {
  // Wait for page to load
  await page.waitForLoadState('domcontentloaded')

  // Wait for login form elements using data-testid
  await page.waitForSelector('[data-testid="username-input"]', { timeout: 15000 })
  await page.waitForSelector('[data-testid="password-input"]', { timeout: 15000 })
  await page.waitForSelector('[data-testid="login-button"]', { timeout: 15000 })
}

// Helper function to complete slider captcha
async function completeCaptcha(page) {
  // Wait for captcha to be visible
  const captcha = page.locator('.slider-captcha')
  await captcha.waitFor({ state: 'visible', timeout: 5000 })

  // Trigger success event on the slider captcha component
  await page.evaluate(() => {
    // Find the slider captcha element
    const sliderCaptcha = document.querySelector('.slider-captcha')
    if (sliderCaptcha) {
      // Get the Vue instance associated with this element
      // @ts-ignore
      const vueInstance = sliderCaptcha.__vueParentComponent
      if (vueInstance) {
        // Set isSuccess to true
        // @ts-ignore
        vueInstance.ctx.isSuccess.value = true
        // Emit success event
        // @ts-ignore
        vueInstance.emit('success')
      }
    }
  })

  // Wait for Vue to update the state
  await page.waitForTimeout(500)
}

// Helper function to perform login
async function performLogin(page, username, password) {
  const usernameInput = page.locator('[data-testid="username-input"]')
  const passwordInput = page.locator('[data-testid="password-input"]')
  const loginButton = page.locator('[data-testid="login-button"]')

  // Clear and fill inputs
  await usernameInput.clear()
  await usernameInput.fill(username)
  await passwordInput.clear()
  await passwordInput.fill(password)

  // Complete captcha
  await completeCaptcha(page)

  // Wait for login button to be enabled
  await expect(loginButton).toBeEnabled({ timeout: 5000 })

  // Click login
  await loginButton.click()
}

test.describe('Login and Basic Navigation', () => {
  test('should login with admin credentials', async ({ page }) => {
    await page.goto('/login')
    await waitForLoginPage(page)
    await performLogin(page, 'admin', '123456')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 })
  })

  test('should login with user credentials', async ({ page }) => {
    await page.goto('/login')
    await waitForLoginPage(page)
    await performLogin(page, 'user', '123456')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 })
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await waitForLoginPage(page)

    await performLogin(page, 'invalid', 'invalid')

    // Should show error message
    await expect(
      page.locator('.ant-message-error, .ant-alert-error, .ant-notification-notice').first()
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Table Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await waitForLoginPage(page)
    await performLogin(page, 'admin', '123456')
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
