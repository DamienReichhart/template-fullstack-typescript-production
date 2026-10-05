import { expect, loginViaUi, registerViaUi, test } from '../support/fixtures.ts';
import { en } from '../support/messages.ts';

const NEW_PASSWORD = 'a-brand-new-passphrase';

test('resets a forgotten password through the emailed link', async ({ page, mailbox }) => {
  const email = await registerViaUi(page);
  await page.context().clearCookies();
  const { fields, forgotPassword, resetPassword } = en.auth;

  await page.goto('/en/forgot-password');
  await page.getByLabel(fields.email).fill(email);
  await page.getByRole('button', { name: forgotPassword.submit }).click();
  await expect(page.getByText(forgotPassword.sent)).toBeVisible();

  await page.goto(await mailbox.linkFrom(email, 'reset-password', '/reset-password'));
  await page.getByLabel(fields.newPassword, { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel(fields.confirmPassword).fill(NEW_PASSWORD);
  await page.getByRole('button', { name: resetPassword.submit }).click();
  await expect(page.getByText(resetPassword.success)).toBeVisible();

  await page.getByRole('link', { name: resetPassword.backToLogin }).click();
  await loginViaUi(page, email, NEW_PASSWORD);
  await expect(page).toHaveURL(/\/en\/dashboard$/);
});
