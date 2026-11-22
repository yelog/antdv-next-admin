import { expect, test, type Locator } from '@playwright/test';

import { signIn } from './helpers/signIn';

async function recordPageSwitch(workspace: Locator): Promise<void> {
  await workspace.evaluate((scroll) => {
    const previous = scroll.firstElementChild;
    const observer = new MutationObserver(() => {
      const current = scroll.firstElementChild;
      if (!current || current === previous) return;

      const { opacity, transform, transitionDuration, transitionProperty } =
        getComputedStyle(current);
      scroll.setAttribute(
        'data-test-page-motion',
        JSON.stringify({
          pageCount: scroll.childElementCount,
          opacity,
          transform,
          transitionDuration,
          transitionProperty,
        }),
      );
      observer.disconnect();
    });

    scroll.removeAttribute('data-test-page-motion');
    observer.observe(scroll, { childList: true });
  });
}

async function indicatorOffset(tabs: Locator): Promise<number> {
  return tabs.evaluate((bar) => {
    const indicator = bar.querySelector('.ant-tabs-ink-bar')?.getBoundingClientRect();
    const selected = bar.querySelector('.ant-tabs-tab-active')?.getBoundingClientRect();
    if (!indicator || !selected || !indicator.width) return Number.POSITIVE_INFINITY;

    return Math.abs(indicator.left + indicator.width / 2 - selected.left - selected.width / 2);
  });
}

test('moves a single tab indicator and fades in the route without keeping the old page', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await signIn(page, 'admin');

  const workspace = page.locator('.page-scroll');
  const tabs = page.locator('.tab-bar');
  const home = tabs.getByRole('tab').first();
  const sidebar = page.locator('.sidebar-menu');
  await sidebar.getByRole('menuitem', { name: /示例中心/ }).click();
  await sidebar.getByRole('menuitem', { name: /表单与输入/ }).click();
  await sidebar.getByRole('menuitem', { name: /表单示例/ }).click();
  await expect(page).toHaveURL('/examples/form');

  const indicator = tabs.locator('.ant-tabs-ink-bar');
  await expect(indicator).toBeVisible();
  await expect(indicator).toHaveCSS('transition-duration', '0.16s, 0.16s, 0.16s');
  await expect.poll(() => indicatorOffset(tabs)).toBeLessThan(1);
  const indicatorOnForm = await indicator.elementHandle();

  await recordPageSwitch(workspace);
  await home.click();
  await expect(page).toHaveURL('/dashboard');
  await expect(workspace).toHaveAttribute(
    'data-test-page-motion',
    JSON.stringify({
      pageCount: 1,
      opacity: '0.68',
      transform: 'none',
      transitionDuration: '0.15s',
      transitionProperty: 'opacity',
    }),
  );
  expect(await indicatorOnForm?.evaluate((element) => element.isConnected)).toBe(true);
  await expect.poll(() => indicatorOffset(tabs)).toBeLessThan(1);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(indicator).toHaveCSS('transition-duration', '0s');
  await recordPageSwitch(workspace);
  await tabs.getByRole('tab', { name: /表单示例/ }).click();
  await expect(page).toHaveURL('/examples/form');
  await expect(workspace).toHaveAttribute(
    'data-test-page-motion',
    JSON.stringify({
      pageCount: 1,
      opacity: '1',
      transform: 'none',
      transitionDuration: '0s',
      transitionProperty: 'all',
    }),
  );
  await expect.poll(() => indicatorOffset(tabs)).toBeLessThan(1);
});

test('labels the fixed reply demo and hides both entries on mobile', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await signIn(page, 'admin');

  const toggle = page.getByRole('button', { name: 'AI 协作演示', exact: true });
  const panel = page.getByRole('complementary', { name: 'AI 协作演示' });
  await toggle.click();
  await expect(panel.getByText(/输入内容仅保留在当前面板/)).toBeVisible();
  await panel.getByRole('textbox').fill('测试演示回复');
  await panel.getByRole('button', { name: /提\s*交/ }).click();
  const reply = panel.locator('.message-item.is-assistant');
  await expect(reply).toContainText('预设回复');
  await expect(reply).not.toHaveClass(/is-streaming/);

  await panel.getByRole('link', { name: '前往操作日志试用筛选' }).click();
  await expect(page).toHaveURL('/system/log');
  await expect(panel).toHaveCount(0);
  await toggle.click();
  await expect(panel).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(toggle).toHaveCount(0);
  await expect(panel).toHaveCount(0);
  await page.getByRole('button', { name: '更多', exact: true }).click();
  const settings = page.getByRole('menuitem', { name: '偏好设置' });
  await expect(settings).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /AI.*演示/ })).toHaveCount(0);
  await settings.click();
  const drawer = page.locator('.settings-drawer');
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('switch', { name: 'AI 对话分屏演示' })).toHaveCount(0);
});
