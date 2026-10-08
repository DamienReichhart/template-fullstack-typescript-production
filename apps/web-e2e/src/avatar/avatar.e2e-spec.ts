import type { Page } from '@playwright/test';

import { expect, registerViaUi, test, uniqueEmail } from '../support/fixtures.ts';
import type { Mailbox } from '../support/mailbox.ts';
import { en } from '../support/messages.ts';

/** A real 1×1 PNG. */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

async function verifiedOnDashboard(page: Page, mailbox: Mailbox): Promise<void> {
  const email = await registerViaUi(page, uniqueEmail('avatar'));
  await page.goto(await mailbox.linkFrom(email, 'verify-email', '/verify-email'));
  await expect(page.getByText(en.auth.verifyEmail.success)).toBeVisible();
  await page.goto('/en/dashboard');
}

async function choosePicture(page: Page, file: { name: string; mimeType: string; buffer: Buffer }) {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /^(Choose a picture|Change picture)$/ }).click();
  await (await chooser).setFiles(file);
}

test.describe('avatar', () => {
  test('uploads a picture straight to storage, shows it, then removes it', async ({
    page,
    mailbox,
  }) => {
    await verifiedOnDashboard(page, mailbox);
    const card = page.locator('[data-slot=card]').filter({ hasText: en.avatar.title });
    const picture = card.getByRole('img', { name: en.avatar.alt.replace('{name}', 'E2E Web') });
    await expect(picture).toHaveText('EW');

    const storageUpload = page.waitForResponse(
      (response) => response.request().method() === 'POST' && /:9000\//.test(response.url()),
    );
    await choosePicture(page, { name: 'me.png', mimeType: 'image/png', buffer: PNG });

    expect((await storageUpload).status()).toBe(204);
    await expect(picture).toHaveAttribute('src', /identity\/avatars\/.+X-Amz-Signature=/);
    // The picture really loads from the bucket, cross-origin.
    await expect
      .poll(() =>
        picture.evaluate(
          (img) => (img as { complete: boolean; naturalWidth: number }).naturalWidth,
        ),
      )
      .toBe(1);

    await card.getByRole('button', { name: en.avatar.remove }).click();
    await expect(picture).toHaveText('EW');
  });

  test('refuses a file that is not a picture before sending it', async ({ page, mailbox }) => {
    await verifiedOnDashboard(page, mailbox);

    await choosePicture(page, {
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not a picture'),
    });

    await expect(page.getByText(en.validation.avatar.contentType)).toBeVisible();
  });
});
