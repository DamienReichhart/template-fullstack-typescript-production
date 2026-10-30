import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Page } from '@playwright/test';

import { expect, registerViaUi, test, uniqueEmail } from '../support/fixtures.ts';
import type { Mailbox } from '../support/mailbox.ts';
import { en } from '../support/messages.ts';

/** A two-second HEVC 10-bit HDR clip, made with the local ffmpeg: what an iPhone records. */
function hdrClip(): Buffer {
  const directory = mkdtempSync(join(tmpdir(), 'web-e2e-video-'));
  try {
    const path = join(directory, 'clip.mov');
    execFileSync('ffmpeg', [
      ...['-hide_banner', '-loglevel', 'error', '-y'],
      ...['-f', 'lavfi', '-i', 'testsrc2=size=640x360:rate=30', '-t', '2'],
      // Tags set on the frames: ffmpeg 7 ignores `-color_*` options when the frames say otherwise.
      ...['-vf', 'format=yuv420p10le,setparams=color_primaries=bt2020:color_trc=arib-std-b67'],
      ...['-c:v', 'libx265', '-x265-params', 'log-level=error'],
      ...['-tag:v', 'hvc1', path],
    ]);
    return readFileSync(path);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

async function verifiedOnVideos(page: Page, mailbox: Mailbox): Promise<void> {
  const email = await registerViaUi(page, uniqueEmail('videos'));
  await page.goto(await mailbox.linkFrom(email, 'verify-email', '/verify-email'));
  await expect(page.getByText(en.auth.verifyEmail.success)).toBeVisible();
  await page.goto('/en/videos');
}

async function chooseVideo(page: Page, file: { name: string; mimeType: string; buffer: Buffer }) {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: en.videos.choose }).click();
  await (await chooser).setFiles(file);
}

test.describe('videos', () => {
  test('uploads a video straight to storage, then plays it once converted', async ({
    page,
    mailbox,
  }) => {
    await verifiedOnVideos(page, mailbox);
    await expect(page.getByText(en.videos.empty)).toBeVisible();

    const storageUpload = page.waitForResponse(
      (response) => response.request().method() === 'POST' && /:9000\//.test(response.url()),
    );
    await chooseVideo(page, { name: 'clip.mov', mimeType: 'video/quicktime', buffer: hdrClip() });

    expect((await storageUpload).status()).toBe(204);
    await expect(page.getByText(en.videos.uploaded)).toBeVisible();
    // The list polls while the worker converts; the player appears once the video is ready.
    await expect(page.getByText(en.videos.status.READY, { exact: true })).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator('video')).toHaveAttribute('src', /media\/videos\/.+X-Amz-Signature=/);
  });

  test('refuses a file that is not a video before sending it', async ({ page, mailbox }) => {
    await verifiedOnVideos(page, mailbox);

    await chooseVideo(page, {
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not a video'),
    });

    await expect(page.getByText(en.validation.video.contentType)).toBeVisible();
  });
});
