import { expect, loginViaUi, registerViaUi, test } from '../support/fixtures.ts';
import { en, fr } from '../support/messages.ts';

test.describe('session', () => {
  test('sends guests to the login page and back where they were going', async ({ page }) => {
    const email = await registerViaUi(page);
    await page.context().clearCookies();

    await page.goto('/en/dashboard');
    await expect(page).toHaveURL(/\/en\/login\?returnTo=%2Fen%2Fdashboard$/);

    await loginViaUi(page, email);
    await expect(page).toHaveURL(/\/en\/dashboard$/);
  });

  test('keeps signed-in users away from the guest pages', async ({ page }) => {
    await registerViaUi(page);
    await page.goto('/en/login');
    await expect(page).toHaveURL(/\/en\/dashboard$/);
  });

  test('signs out', async ({ page }) => {
    await registerViaUi(page);
    await page.getByRole('button', { name: en.auth.logout.submit }).click();
    await expect(page).toHaveURL(/\/en\/login$/);

    await page.goto('/en/dashboard');
    await expect(page).toHaveURL(/\/en\/login/);
  });

  test('explains rejected credentials in the visitor language', async ({ page }) => {
    await page.goto('/fr/login');
    await page.getByLabel(fr.auth.fields.email).fill('nobody@example.com');
    await page.getByLabel(fr.auth.fields.password, { exact: true }).fill('not-the-password-123');
    await page.getByRole('button', { name: fr.auth.login.submit }).click();

    await expect(page.locator('form [role=alert]')).toHaveText(fr.errors.INVALID_CREDENTIALS);
  });
});
