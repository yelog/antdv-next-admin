import { expect, type Page } from '@playwright/test';

export async function signIn(page: Page, account: 'admin' | 'user'): Promise<void> {
  await page.goto('/login');
  await page
    .getByRole('group', { name: '演示账号' })
    .getByRole('button', { name: new RegExp(`\\b${account}\\b`) })
    .click();

  const submit = page.getByRole('button', { name: /^登\s*录$/ });
  await expect(submit).toBeDisabled();
  await page
    .getByRole('group', { name: '验证演示' })
    .getByRole('button', { name: '直接验证', exact: true })
    .click();
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page).toHaveURL('/dashboard');
}
