import { expect, registerViaUi, test } from '../support/fixtures.ts';
import { en } from '../support/messages.ts';

const copy = en.system.connectionTest;

test.describe('api connection test', () => {
  test('reports the api and its dependencies', async ({ page }) => {
    await registerViaUi(page);
    await page.getByRole('button', { name: copy.ping, exact: true }).click();

    await expect(page.getByText(copy.status.ok)).toBeVisible();
    await expect(page.getByText(copy.services.database)).toBeVisible();
    await expect(page.getByText(copy.services.redis)).toBeVisible();
  });

  test('gates the authenticated test on a verified email', async ({ page, mailbox }) => {
    const email = await registerViaUi(page);
    const authenticated = page.getByRole('button', { name: copy.authenticatedPing });

    await authenticated.click();
    await expect(page.getByText(copy.requiresVerifiedEmail)).toBeVisible();

    await page.goto(await mailbox.linkFrom(email, 'verify-email', '/verify-email'));
    await expect(page.getByText(en.auth.verifyEmail.success)).toBeVisible();
    await page.goto('/en/dashboard');
    await authenticated.click();
    const greeting = copy.authenticatedAs.replace('{email}', email).replace('{role}', 'USER');
    await expect(page.getByText(greeting)).toBeVisible();
  });
});
