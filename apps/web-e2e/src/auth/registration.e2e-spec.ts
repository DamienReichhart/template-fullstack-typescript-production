import { expect, registerViaUi, test, uniqueEmail } from '../support/fixtures.ts';
import { en } from '../support/messages.ts';

test.describe('registration', () => {
  test('registers, then verifies the email through the emailed link', async ({ page, mailbox }) => {
    const email = await registerViaUi(page, uniqueEmail('register'));
    const banner = page.getByRole('alert').filter({ hasText: email });
    await expect(banner).toBeVisible();

    await page.goto(await mailbox.linkFrom(email, 'verify-email', '/verify-email'));
    await expect(page.getByText(en.auth.verifyEmail.success)).toBeVisible();

    await page.goto('/en/dashboard');
    await expect(page.getByText(email).first()).toBeVisible();
    await expect(banner).toBeHidden();
  });

  test('keeps the user on the form when the email is already taken', async ({ page }) => {
    const email = await registerViaUi(page);
    await page.context().clearCookies();

    await page.goto('/en/register');
    const { fields, register } = en.auth;
    await page.getByLabel(fields.name).fill('Twin');
    await page.getByLabel(fields.email).fill(email);
    await page.getByLabel(fields.password, { exact: true }).fill('another-long-passphrase');
    await page.getByLabel(fields.confirmPassword).fill('another-long-passphrase');
    await page.getByRole('button', { name: register.submit }).click();

    await expect(page).toHaveURL(/\/en\/register$/);
    await expect(page.locator('form [role=alert]')).toBeVisible();
  });
});
