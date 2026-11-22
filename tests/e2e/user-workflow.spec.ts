import type { Locator, Page } from '@playwright/test';

import { expect, test } from '@playwright/test';

import { mockRoles } from '../../mock/data/roles.data';
import { signIn } from './helpers/signIn';

const usersPath = '/organization/user';

function userList(page: Page): Locator {
  return page.locator('.user-management');
}

function resultSummary(page: Page): Locator {
  return userList(page).locator('.user-table-context [tabindex="-1"]');
}

function userRow(page: Page, username: string): Locator {
  return userList(page)
    .getByRole('row')
    .filter({ has: page.getByRole('cell', { name: username, exact: true }) });
}

async function openUserList(page: Page): Promise<void> {
  await signIn(page, 'admin');
  await page.goto(usersPath);
  await expect(resultSummary(page)).toHaveText('共 4 条结果 · 未应用筛选');
}

function searchScope(page: Page): Locator {
  return userList(page).locator('.pro-table-search');
}

async function importUsers(page: Page): Promise<void> {
  const records = Array.from({ length: 22 }, (_, index) => {
    const number = String(index + 1).padStart(2, '0');
    return `workflow_${number},Workflow User ${number},workflow_${number}@example.com`;
  });
  await userList(page)
    .locator('input[type="file"]')
    .setInputFiles({
      name: 'users.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(['用户名,真实姓名,邮箱', ...records].join('\n')),
    });
  await expect(resultSummary(page)).toHaveText('共 26 条结果 · 未应用筛选');
}

test('keeps the applied filters, page and scroll on save and restores focus to Edit', async ({
  page,
}) => {
  await openUserList(page);
  await page.setViewportSize({ width: 1200, height: 540 });
  await importUsers(page);

  const search = searchScope(page);
  const username = search.getByPlaceholder('请输入用户名');
  await username.fill('  workflow_  ');
  await search.getByRole('button', { name: '搜索', exact: true }).click();
  await expect(resultSummary(page)).toHaveText('共 22 条结果 · 用户名：workflow_');

  const pagination = userList(page).locator('.ant-pagination');
  await pagination.getByTitle('2', { exact: true }).click();
  const row = userRow(page, 'workflow_20');
  await expect(row.getByRole('cell', { name: 'Workflow User 20', exact: true })).toBeVisible();
  await username.fill('unsubmitted-draft');

  const edit = row.getByRole('button', { name: /^编\s*辑$/ });
  await edit.scrollIntoViewIfNeeded();
  const body = userList(page).locator('.ant-table-body');
  const scrollTop = await body.evaluate((element) => element.scrollTop);
  expect(scrollTop).toBeGreaterThan(0);

  await edit.press('Enter');
  const dialog = page.getByRole('dialog', { name: '编辑用户' });
  await dialog.getByRole('combobox').last().press('ArrowDown');
  await page.locator('.ant-select-dropdown:visible').getByText('Manager', { exact: true }).click();
  await dialog.getByRole('button', { name: /^保\s*存$/ }).click();

  await expect(row).toHaveClass(/user-row-updated/);
  await expect(row.getByRole('cell', { name: 'Manager', exact: true })).toHaveCSS(
    'animation-duration',
    '0.6s',
  );
  await expect(edit).toBeFocused();
  await expect(body).toHaveJSProperty('scrollTop', scrollTop);
  await expect(edit).toBeInViewport();
  await expect(pagination.locator('.ant-pagination-item-active')).toHaveText('2');
  await expect(username).toHaveValue('unsubmitted-draft');
  await expect(resultSummary(page)).toHaveText('共 22 条结果 · 用户名：workflow_');
  await expect(row).not.toHaveClass(/user-row-updated/);
  await expect(userList(page).getByRole('status')).toHaveText('用户更新成功');

  const downloading = page.waitForEvent('download');
  await userList(page)
    .getByRole('button', { name: /导\s*出/ })
    .click();
  const download = await downloading;
  expect(download.suggestedFilename()).toMatch(/^用户管理_.+\.csv$/);
  expect(await download.failure()).toBeNull();
});

test('shows a static save highlight and status with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openUserList(page);

  const row = userRow(page, 'manager');
  const edit = row.getByRole('button', { name: /^编\s*辑$/ });
  await edit.click();
  const dialog = page.getByRole('dialog', { name: '编辑用户' });
  await dialog.getByPlaceholder('请输入真实姓名').fill('Updated Manager');
  await dialog.getByRole('button', { name: /^保\s*存$/ }).click();

  await expect(row).toHaveClass(/user-row-updated/);
  const updatedCell = row.getByRole('cell', { name: 'Updated Manager', exact: true });
  await expect(updatedCell).toHaveCSS('animation-name', 'none');
  await expect(updatedCell).not.toHaveCSS('box-shadow', 'none');
  await expect(edit).toBeFocused();
  await expect(row).not.toHaveClass(/user-row-updated/);
  await expect(userList(page).getByRole('status')).toHaveText('用户更新成功');
});

test('preserves an assigned role that is missing from the role list', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/organization/role');

  const roleRow = page.getByRole('row').filter({
    has: page.getByRole('cell', { name: 'Manager', exact: true }),
  });
  await roleRow.getByRole('button', { name: /删\s*除/ }).click();
  const confirmation = page.getByRole('dialog').filter({
    has: page.getByText('确定要删除该角色吗？', { exact: true }),
  });
  await confirmation.getByRole('button', { name: /^确\s*定$/ }).click();
  await confirmation
    .filter({ has: page.getByText('删除角色', { exact: true }) })
    .getByRole('button', { name: /^确\s*定$/ })
    .click();
  await expect(roleRow).toHaveCount(0);

  await page.locator('.sidebar-menu').getByRole('menuitem', { name: '用户管理' }).click();
  const user = userRow(page, 'manager');
  await expect(user.getByRole('cell', { name: 'Manager', exact: true })).toBeVisible();
  await user.getByRole('button', { name: /^编\s*辑$/ }).click();
  const dialog = page.getByRole('dialog', { name: '编辑用户' });
  await expect(dialog.getByText('Manager', { exact: true })).toBeVisible();
  await dialog.getByPlaceholder('请输入真实姓名').fill('Manager with existing role');
  await dialog.getByRole('button', { name: /^保\s*存$/ }).click();

  await expect(user.getByRole('cell', { name: 'Manager with existing role' })).toBeVisible();
  await expect(user.getByRole('cell', { name: 'Manager', exact: true })).toBeVisible();
});

test('focuses the results when an edited user no longer matches the filter', async ({ page }) => {
  await openUserList(page);

  const search = searchScope(page);
  const email = search.getByPlaceholder('请输入邮箱');
  await email.fill('manager@example.com');
  await search.getByRole('button', { name: '搜索', exact: true }).click();
  await expect(resultSummary(page)).toHaveText('共 1 条结果 · 邮箱：manager@example.com');

  await userRow(page, 'manager')
    .getByRole('button', { name: /^编\s*辑$/ })
    .click();
  const dialog = page.getByRole('dialog', { name: '编辑用户' });
  await dialog.getByPlaceholder('请输入邮箱').fill('manager-updated@example.com');
  await dialog.getByRole('button', { name: /^保\s*存$/ }).click();

  await expect(userRow(page, 'manager')).toHaveCount(0);
  await expect(resultSummary(page)).toHaveText('共 0 条结果 · 邮箱：manager@example.com');
  await expect(resultSummary(page)).toBeFocused();
  await expect(userList(page).getByRole('status')).toHaveText('用户更新成功，已不在当前结果中。');
  await expect(email).toHaveValue('manager@example.com');

  await search.getByRole('button', { name: '重置', exact: true }).click();
  await expect(resultSummary(page)).toHaveText('共 4 条结果 · 未应用筛选');
  await userRow(page, 'manager').getByRole('button', { expanded: false }).click();
  await expect(userList(page).getByText('manager-updated@example.com')).toBeVisible();
});

test('keeps contacts and one delete confirmation reachable on a narrow screen', async ({
  page,
}) => {
  await openUserList(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const list = userList(page);
  const row = userRow(page, 'guest');
  await expect(list.getByRole('columnheader', { name: '用户名' })).toBeVisible();
  await expect(list.getByRole('columnheader', { name: '角色' })).toBeVisible();
  await expect(list.getByRole('columnheader', { name: '状态' })).toBeVisible();
  await expect(list.getByRole('columnheader', { name: /邮箱|手机号/ })).toHaveCount(0);
  await expect(list.getByText('guest@example.com')).toHaveCount(0);
  await expect(row.getByRole('button', { name: /^删\s*除$/ })).toHaveCount(0);

  await row.getByRole('button', { expanded: false }).click();
  await expect(list.getByText('guest@example.com')).toBeInViewport();
  await expect(list.getByText('13800138003')).toBeInViewport();
  await row.getByRole('button', { expanded: true }).click();

  await row.getByRole('button', { name: /^更\s*多$/ }).press('Enter');
  await page.getByRole('menuitem', { name: '删除' }).click();
  const confirmation = page.getByRole('dialog').filter({ hasText: '确定要删除该用户吗？' });
  await expect(confirmation).toHaveCount(1);
  await confirmation.getByRole('button', { name: /^删\s*除$/ }).click();

  await expect(confirmation).toHaveCount(0);
  await expect(row).toHaveCount(0);
  await expect(resultSummary(page)).toHaveText('共 3 条结果 · 未应用筛选');
});

test('respects the user route and hides writes from an account with view permission only', async ({
  page,
}) => {
  await signIn(page, 'user');
  await expect(
    page.locator('.sidebar-menu').getByRole('menuitem', { name: /组织权限/ }),
  ).toHaveCount(0);

  const readOnlyRole = mockRoles.find((role) => role.code === 'user');
  if (!readOnlyRole) throw new Error('Read-only demo role is missing');
  await page.evaluate((permissions) => {
    const cachedUser = localStorage.getItem('user_info');
    if (!cachedUser) throw new Error('Demo user fixture is missing');
    localStorage.setItem('user_info', JSON.stringify({ ...JSON.parse(cachedUser), permissions }));
  }, readOnlyRole.permissions);
  await page.goto(usersPath);

  const list = userList(page);
  await expect(resultSummary(page)).toHaveText('共 4 条结果 · 未应用筛选');
  await expect(list.getByRole('button', { name: /导\s*出/ })).toBeVisible();
  await expect(list.getByRole('button', { name: /导\s*入|创建用户|编\s*辑|更\s*多/ })).toHaveCount(
    0,
  );
  await expect(list.getByRole('columnheader', { name: '操作' })).toHaveCount(0);
});
