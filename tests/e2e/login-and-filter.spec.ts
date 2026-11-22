import { expect, test, type Page } from '@playwright/test';

async function signIn(page: Page, account: 'admin' | 'user'): Promise<void> {
  await page.goto('/login');
  await page
    .locator('.demo-accounts')
    .getByRole('button', { name: new RegExp(`^${account}\\b`) })
    .click();

  const submit = page.getByRole('button', { name: /^登\s*录$/ });
  await expect(submit).toBeDisabled();
  const slider = page.locator('.slider-bg');
  const handle = slider.locator('.slider-handle');
  await handle.scrollIntoViewIfNeeded();
  const trackBox = await slider.boundingBox();
  const handleBox = await handle.boundingBox();
  if (!trackBox || !handleBox) throw new Error('Login slider is not visible');
  const centerX = handleBox.x + handleBox.width / 2;
  const centerY = handleBox.y + handleBox.height / 2;
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(trackBox.x + trackBox.width, centerY, { steps: 12 });
  await page.mouse.up();

  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page).toHaveURL('/dashboard');
}

test('keeps the filtered user table until its tab is closed', async ({ page }) => {
  await signIn(page, 'admin');
  const sidebar = page.locator('.sidebar-menu');
  const organizationMenu = sidebar.getByRole('menuitem', { name: /组织权限/ });
  const usersMenu = sidebar.getByRole('menuitem', { name: /用户管理/ });
  await organizationMenu.click();
  await usersMenu.click();
  await expect(page).toHaveURL('/organization/user');

  const main = page.locator('#main-content');
  const username = main.getByPlaceholder('请输入用户名');
  const manager = main.getByRole('cell', { name: 'manager', exact: true });
  const otherUser = main.getByRole('cell', { name: 'guest', exact: true });
  await expect(otherUser).toBeVisible();
  await username.fill('manager');
  await main
    .locator('.pro-table-search')
    .getByRole('button', { name: /搜\s*索/ })
    .click();
  await expect(manager).toBeVisible();
  await expect(otherUser).toHaveCount(0);

  const tabs = page.locator('.tab-bar');
  const usersTab = tabs.getByRole('tab', { name: /用户管理/ });
  await tabs.getByRole('tab', { name: /数据看板/ }).click();
  await expect(page).toHaveURL('/dashboard');
  await usersTab.click();
  await expect(username).toHaveValue('manager');
  await expect(manager).toBeVisible();
  await expect(otherUser).toHaveCount(0);

  await usersTab.locator('..').getByRole('button').click();
  await expect(usersTab).toHaveCount(0);
  await expect(page).toHaveURL('/dashboard');
  await organizationMenu.click();
  await usersMenu.click();
  await expect(username).toHaveValue('');
  await expect(otherUser).toBeVisible();
});

test('keeps unsaved state on a page under nested menu groups', async ({ page }) => {
  await signIn(page, 'admin');
  const sidebar = page.locator('.sidebar-menu');
  await sidebar.getByRole('menuitem', { name: /示例中心/ }).click();
  await sidebar.getByRole('menuitem', { name: /表单与输入/ }).click();
  await sidebar.getByRole('menuitem', { name: /表单示例/ }).click();
  await expect(page).toHaveURL('/examples/form');

  const username = page.locator('#main-content').getByPlaceholder('请输入用户名');
  await username.fill('demo-draft');
  const tabs = page.locator('.tab-bar');
  await tabs.getByRole('tab', { name: /数据看板/ }).click();
  await expect(page).toHaveURL('/dashboard');
  await tabs.getByRole('tab', { name: /表单示例/ }).click();
  await expect(username).toHaveValue('demo-draft');
});

test('shows the dashboard and limited menu for the regular demo user', async ({ page }) => {
  await signIn(page, 'user');
  const sidebar = page.locator('.sidebar-menu');
  await expect(sidebar.getByRole('menuitem', { name: /数据看板/ })).toBeVisible();
  await expect(sidebar.getByRole('menuitem', { name: /组织权限/ })).toHaveCount(0);
  await expect(page.locator('.dashboard-container canvas').first()).toBeVisible();
});
