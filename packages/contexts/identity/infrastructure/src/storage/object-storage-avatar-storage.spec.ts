import { describe, expect, it } from 'bun:test';
import {
  AvatarImage,
  AvatarUploadNotFoundError,
  InvalidAvatarError,
} from '@template/identity-domain';
import { DirectUploads } from '@template/storage';
import { InMemoryObjectStorage } from '@template/storage/testing';

import { ObjectStorageAvatarStorage } from './object-storage-avatar-storage.ts';

const userId = '0199b0a0-0000-7000-8000-000000000001';
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);

function setup() {
  const storage = new InMemoryObjectStorage();
  const avatars = new ObjectStorageAvatarStorage(storage, new DirectUploads(storage));
  return { storage, avatars };
}

describe('ObjectStorageAvatarStorage', () => {
  it('keeps a valid upload as an immutable object under the user prefix', async () => {
    const { storage, avatars } = setup();
    const ticket = await avatars.issueUpload(
      userId,
      AvatarImage.create('image/png', PNG.byteLength),
    );
    await storage.completeUpload(ticket.fields, PNG);

    const key = await avatars.keep(userId, ticket.uploadId);

    expect(key).toBe(`identity/avatars/${userId}/${ticket.uploadId}`);
    expect(await storage.head(key)).toMatchObject({
      contentType: 'image/png',
      cacheControl: 'private, max-age=31536000, immutable',
    });
    expect(storage.presignedUploads[0]).toMatchObject({ minBytes: 12, maxBytes: 12 });
  });

  it('translates storage refusals into identity errors', async () => {
    const { storage, avatars } = setup();
    await expect(avatars.keep(userId, 'nope')).rejects.toBeInstanceOf(AvatarUploadNotFoundError);

    const html = new TextEncoder().encode('<svg onload=alert(1)>');
    const ticket = await avatars.issueUpload(
      userId,
      AvatarImage.create('image/png', html.byteLength),
    );
    await storage.completeUpload(ticket.fields, html);
    const error = await avatars.keep(userId, ticket.uploadId).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(InvalidAvatarError);
    expect((error as InvalidAvatarError).reason).toBe('content-mismatch');
  });

  it('resolves display URLs and deletes files', async () => {
    const { storage, avatars } = setup();
    await storage.put('identity/avatars/u/1', PNG, { contentType: 'image/png' });

    expect(await avatars.urlOf('identity/avatars/u/1')).toContain('identity/avatars/u/1');
    await avatars.delete('identity/avatars/u/1');
    expect(storage.objects.size).toBe(0);
  });
});
