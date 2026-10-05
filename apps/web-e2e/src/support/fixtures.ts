import { test as base, expect, type Page } from '@playwright/test';

import { Mailbox } from './mailbox.ts';
import { en } from './messages.ts';

export const PASSWORD = 'correct-horse-battery-staple';

/** Unique per call, so tests never collide and never need a database reset. */
export function uniqueEmail(label = 'web'): string {
  return `e2e-${label}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}@example.com`;
}

export const test = base.extend<{ resetRateLimits: void }, { mailbox: Mailbox }>({
  mailbox: [
    // eslint-disable-next-line no-empty-pattern -- Playwright requires a destructured first argument.
    async ({}, use) => {
      const mailbox = new Mailbox();
      await use(mailbox);
      mailbox.close();
    },
    { scope: 'worker' },
  ],
  resetRateLimits: [
    async ({ mailbox }, use) => {
      await mailbox.resetRateLimits();
      await use();
    },
    { auto: true },
  ],
});

export { expect };

/** Fills and submits the registration form; resolves on the dashboard. */
export async function registerViaUi(page: Page, email = uniqueEmail()): Promise<string> {
  const { fields, register } = en.auth;
  await page.goto('/en/register');
  await page.getByLabel(fields.name).fill('E2E Web');
  await page.getByLabel(fields.email).fill(email);
  await page.getByLabel(fields.password, { exact: true }).fill(PASSWORD);
  await page.getByLabel(fields.confirmPassword).fill(PASSWORD);
  await page.getByRole('button', { name: register.submit }).click();
  await expect(page).toHaveURL(/\/en\/dashboard$/);
  return email;
}

/** Signs in through the login form, from wherever the page is. */
export async function loginViaUi(page: Page, email: string, password = PASSWORD): Promise<void> {
  const { fields, login } = en.auth;
  await page.getByLabel(fields.email).fill(email);
  await page.getByLabel(fields.password, { exact: true }).fill(password);
  await page.getByRole('button', { name: login.submit }).click();
}
