import { afterAll, beforeEach, describe, expect, it } from 'bun:test';

import { createStorageTestContext, postPresignedForm } from '../testing/storage-test-context.ts';
import { DirectUploads } from './direct-uploads.ts';
import type { UploadRejectedError } from './upload-errors.ts';

const context = createStorageTestContext();
const uploads = new DirectUploads(context.storage);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);
const scope = ['identity', 'avatars', 'user-1'];
const rules = { contentTypes: ['image/png'], maxBytes: 1024 };

beforeEach(async () => {
  await context.reset();
});

afterAll(() => {
  context.close();
});

describe('DirectUploads against RustFS', () => {
  it('takes a browser upload from ticket to final key', async () => {
    const ticket = await uploads.issue({ scope, contentType: 'image/png', size: PNG.byteLength });
    const posted = await postPresignedForm(ticket, new Blob([PNG], { type: 'image/png' }));
    expect(posted.status).toBe(204);

    const stored = await uploads.claim({
      scope,
      uploadId: ticket.uploadId,
      destinationKey: `identity/avatars/user-1/${ticket.uploadId}.png`,
      rules,
      cacheControl: 'private, max-age=31536000, immutable',
    });

    expect(stored).toMatchObject({ size: PNG.byteLength, contentType: 'image/png' });
    expect((await context.storage.list({ prefix: 'staging/' })).objects).toEqual([]);
    const download = await fetch((await context.storage.presignDownload(stored.key)).url);
    expect(new Uint8Array(await download.arrayBuffer())).toEqual(PNG);
  });

  it('refuses a file of another size than announced', async () => {
    const ticket = await uploads.issue({ scope, contentType: 'image/png', size: 4 });
    const posted = await postPresignedForm(ticket, new Blob([PNG]));
    expect(posted.status).toBe(400);
  });

  it('rejects and deletes a file that lies about being a PNG', async () => {
    const fake = new TextEncoder().encode('<script>alert(1)</script>');
    const ticket = await uploads.issue({ scope, contentType: 'image/png', size: fake.byteLength });
    await postPresignedForm(ticket, new Blob([fake]));

    const error = await uploads
      .claim({ scope, uploadId: ticket.uploadId, destinationKey: 'identity/avatars/x.png', rules })
      .catch((caught: unknown) => caught);

    expect((error as UploadRejectedError).reason).toBe('content-mismatch');
    expect((await context.storage.list({ prefix: 'staging/' })).objects).toEqual([]);
  });
});
