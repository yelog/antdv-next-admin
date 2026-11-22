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

test('previews and edits operation log filters before running the list query', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/system/log');
  const operations = page.getByRole('tabpanel');
  const form = operations.locator('.pro-table-search');
  const operator = form.getByRole('textbox');
  const rows = operations.locator('tbody tr.ant-table-row');
  const total = operations.locator('.ant-pagination-total-text');
  await expect(rows.first()).toBeVisible();
  const initialTotal = await total.innerText();
  const firstRow = await rows.first().innerText();
  await operator.fill('operator-draft');

  const start = operations.getByRole('button', { name: '自然语言筛选' });
  const dialog = page.getByRole('dialog', { name: '自然语言筛选' });
  await start.click();
  await dialog.getByRole('button', { name: '使用示例' }).click();
  await dialog.getByRole('button', { name: '预览条件' }).click();
  await expect(dialog.getByText('来源：本地示例规则')).toBeVisible();
  for (const value of ['用户管理', '删除', '失败']) {
    await expect(dialog.getByText(value, { exact: true })).toBeVisible();
  }
  await dialog.getByRole('button', { name: '填入筛选表单' }).click();
  await expect(dialog).toBeHidden();
  await expect(operator).toHaveValue('operator-draft');
  for (const value of ['用户管理', '删除', '失败']) {
    await expect(form.getByText(value, { exact: true })).toBeVisible();
  }
  await expect(total).toHaveText(initialTotal);
  expect(await rows.first().innerText()).toBe(firstRow);
  await operator.clear();
  await form.getByRole('button', { name: /搜\s*索/ }).click();
  await expect(total).not.toHaveText(initialTotal);
  await expect(rows.first()).toBeVisible();
  const matchCount = Number((await total.innerText()).match(/\d+/)?.[0]);
  expect(matchCount).toBeGreaterThan(0);
  expect(await rows.count()).toBe(Math.min(matchCount, 10));
  for (const row of await rows.all()) {
    await expect(row.getByRole('cell', { name: '失败', exact: true })).toBeVisible();
    await expect(row.getByRole('cell', { name: '删除', exact: true })).toBeVisible();
    await expect(row.getByRole('cell', { name: 'userManagement', exact: true })).toBeVisible();
  }

  await start.click();
  await dialog.getByRole('textbox').fill('只看失败');
  await dialog.getByRole('button', { name: '预览条件' }).click();
  await expect(dialog.getByRole('button', { name: '填入筛选表单' })).toBeVisible();
  await dialog.getByRole('textbox').fill('昨天失败的操作');
  await expect(dialog.getByRole('button', { name: '填入筛选表单' })).toHaveCount(0);
  await dialog.getByRole('button', { name: '预览条件' }).click();
  await expect(dialog.getByText(/请换一种说法/)).toBeVisible();
  await dialog.getByRole('button', { name: /取\s*消/ }).click();
  await expect(form.getByText('用户管理', { exact: true })).toBeVisible();
  await operations.getByRole('button', { name: /重\s*置/ }).click();
  await expect(total).toHaveText(initialTotal);
});

test('keeps operation log filters outside the regular demo user session', async ({ page }) => {
  await signIn(page, 'user');
  await page.goto('/system/log');
  await expect(page.locator('#main-content')).toBeVisible();
  await expect(page.getByRole('button', { name: '自然语言筛选' })).toHaveCount(0);
  await expect(page.getByRole('tabpanel', { name: '操作日志' })).toHaveCount(0);
});

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
