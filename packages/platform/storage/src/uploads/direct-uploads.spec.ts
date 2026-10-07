import { describe, expect, it } from 'bun:test';

import { InMemoryObjectStorage } from '../testing/in-memory-object-storage.ts';
import { DirectUploads } from './direct-uploads.ts';
import { UploadNotFoundError, UploadRejectedError } from './upload-errors.ts';

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);
const scope = ['identity', 'avatars', 'user-1'];
const rules = { contentTypes: ['image/png', 'image/jpeg'], maxBytes: 100 };

async function setup(contentType = 'image/png', body: Uint8Array | string = PNG) {
  const storage = new InMemoryObjectStorage();
  const uploads = new DirectUploads(storage);
  const size = typeof body === 'string' ? body.length : body.byteLength;
  const ticket = await uploads.issue({ scope, contentType, size });
  await storage.completeUpload(ticket.fields, body);
  const claim = (overrides: Partial<Parameters<DirectUploads['claim']>[0]> = {}) =>
    uploads.claim({
      scope,
      uploadId: ticket.uploadId,
      destinationKey: `identity/avatars/user-1/${ticket.uploadId}.png`,
      rules,
      ...overrides,
    });
  return { storage, uploads, ticket, claim };
}

describe('DirectUploads', () => {
  it('signs a form for one staging key, content type and exact size', async () => {
    const storage = new InMemoryObjectStorage();
    const ticket = await new DirectUploads(storage).issue({
      scope,
      contentType: 'image/png',
      size: 12,
    });

    expect(ticket.uploadId).toMatch(/^[0-9a-f-]{36}$/);
    expect(storage.presignedUploads[0]).toMatchObject({
      key: `staging/identity/avatars/user-1/${ticket.uploadId}`,
      contentType: 'image/png',
      minBytes: 12,
      maxBytes: 12,
    });
  });

  it('moves a valid upload to its final key and drops the staged copy', async () => {
    const { storage, ticket, claim } = await setup();

    const stored = await claim({ cacheControl: 'private, max-age=31536000, immutable' });

    expect(stored).toMatchObject({
      key: `identity/avatars/user-1/${ticket.uploadId}.png`,
      size: PNG.byteLength,
      contentType: 'image/png',
      cacheControl: 'private, max-age=31536000, immutable',
    });
    expect([...storage.objects.keys()]).toEqual([stored.key]);
  });

  it('cannot be claimed twice, nor from another scope, nor with a forged id', async () => {
    const { claim } = await setup();
    await expect(claim({ scope: ['identity', 'avatars', 'user-2'] })).rejects.toBeInstanceOf(
      UploadNotFoundError,
    );
    await claim();
    await expect(claim()).rejects.toBeInstanceOf(UploadNotFoundError);
    await expect(claim({ uploadId: '../../identity/avatars/user-2' })).rejects.toBeInstanceOf(
      UploadNotFoundError,
    );
  });

  it.each([
    ['too-large', 'image/png', PNG, { contentTypes: ['image/png'], maxBytes: 4 }],
    ['content-type', 'image/gif', PNG, rules],
    ['content-mismatch', 'image/jpeg', PNG, rules],
    ['content-mismatch', 'image/png', '<html>not a png</html>', rules],
  ] as const)(
    'rejects %s files and deletes them',
    async (reason, contentType, body, claimRules) => {
      const { storage, claim } = await setup(contentType, body);

      const error = await claim({ rules: claimRules }).catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(UploadRejectedError);
      expect((error as UploadRejectedError).reason).toBe(reason);
      expect(storage.objects.size).toBe(0);
    },
  );

  it('discards a staged upload on request', async () => {
    const { storage, uploads, ticket } = await setup();
    await uploads.discard(scope, ticket.uploadId);
    expect(storage.objects.size).toBe(0);
  });
});
