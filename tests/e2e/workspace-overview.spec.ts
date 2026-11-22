import { expect, test } from '@playwright/test';

import { signIn } from './helpers/signIn';

test('shows recent operations and their destination on the laptop first screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await signIn(page, 'admin');
  const workspace = page.locator('.dashboard-container');
  const trend = workspace.getByRole('heading', { name: '操作趋势' });
  const activity = workspace.getByRole('heading', { name: '最近操作' });
  await expect(trend).toBeInViewport();
  await expect(activity).toBeInViewport();
  await expect(workspace.locator('canvas')).toBeInViewport();
  const recent = workspace.locator('.recent-list li').first();
  await expect(recent).toBeInViewport();
  const graph = await trend.boundingBox();
  const log = await activity.boundingBox();
  expect(log!.x).toBeGreaterThan(graph!.x);
  await workspace.getByRole('link', { name: '查看日志' }).click();
  await expect(page).toHaveURL('/system/log');
  await page
    .locator('.tab-bar')
    .getByRole('tab', { name: /数据看板/ })
    .click();
  await expect(workspace.locator('.shortcuts a[href="/system/log"]')).toBeVisible();
});

test('keeps the trend above the fold on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page, 'admin');
  const workspace = page.locator('.dashboard-container');
  await expect(workspace.locator('canvas')).toBeInViewport({ ratio: 0.5 });
  const boxes = await workspace.locator('.workspace-metrics dt').evaluateAll((labels) =>
    labels.map((label) => ({
      x: label.getBoundingClientRect().x,
      y: label.getBoundingClientRect().y,
    })),
  );
  expect(boxes[0].y).toBe(boxes[1].y);
  expect(boxes[0].x).toBe(boxes[2].x);
  expect(boxes[2].y).toBeGreaterThan(boxes[0].y);
  expect(
    await workspace.evaluate((root) => root.scrollWidth - root.clientWidth),
  ).toBeLessThanOrEqual(1);
});

test('opens user management by keyboard and adds it to workspace quick access', async ({
  page,
}) => {
  await signIn(page, 'admin');
  await page.keyboard.press('Control+k');
  const search = page.getByRole('dialog', { name: '菜单搜索' });
  const input = search.getByRole('textbox');
  await expect(input).toBeFocused();
  await input.fill('用户管理');
  await expect(search.getByText('用户管理', { exact: false }).first()).toBeVisible();
  await input.press('Enter');
  await expect(page).toHaveURL('/organization/user');
  await page
    .locator('.tab-bar')
    .getByRole('tab', { name: /数据看板/ })
    .click();
  const recent = page.locator('.shortcuts a[href="/organization/user"]');
  await expect(recent).toContainText('最近访问');
});

test('limits the personal workspace to accessible destinations and opens the sales example', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'app-menu-favorites',
      JSON.stringify(['/system/log', '/examples/sales']),
    );
  });
  await signIn(page, 'user');
  const workspace = page.locator('.dashboard-container');
  await expect(workspace.getByRole('heading', { name: '最近访问趋势' })).toBeVisible();
  await expect(workspace.getByRole('link', { name: '查看日志' })).toHaveCount(0);
  await expect(workspace.locator('a[href="/system/log"]')).toHaveCount(0);
  const example = workspace.locator('a[href="/examples/sales"]');
  await expect(example).toContainText('已收藏');
  await example.click();
  await expect(page).toHaveURL('/examples/sales');
  await page.getByText('查看月度明细', { exact: true }).click();
  await expect(page.getByRole('heading', { name: '订单来源占比' })).toBeVisible();
  await expect(page.locator('details')).toContainText('34,000');
});
