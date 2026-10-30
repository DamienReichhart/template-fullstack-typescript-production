import { describe, expect, it } from 'bun:test';
import { InvalidVideoError } from '@template/media-domain';

import { createMediaTestKit, OWNER_ID } from '../../testing/media-test-kit.ts';
import { RequestVideoUploadCommand } from './request-video-upload.command.ts';
import { RequestVideoUploadHandler } from './request-video-upload.handler.ts';

describe('RequestVideoUploadHandler', () => {
  it('issues an upload ticket for an acceptable video', async () => {
    const kit = createMediaTestKit();

    const ticket = await new RequestVideoUploadHandler(kit.storage).execute(
      new RequestVideoUploadCommand(OWNER_ID, 'video/quicktime', 50_000_000),
    );

    expect(ticket.fields['Content-Type']).toBe('video/quicktime');
    expect(kit.storage.uploads.get(ticket.uploadId)).toMatchObject({ ownerId: OWNER_ID });
  });

  it('refuses a file breaking the Video rules before issuing anything', async () => {
    const kit = createMediaTestKit();
    const handler = new RequestVideoUploadHandler(kit.storage);

    await expect(
      handler.execute(new RequestVideoUploadCommand(OWNER_ID, 'video/webm', 10)),
    ).rejects.toBeInstanceOf(InvalidVideoError);
    expect(kit.storage.uploads.size).toBe(0);
  });
});
