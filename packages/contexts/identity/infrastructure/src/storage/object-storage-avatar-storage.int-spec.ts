import { afterAll, beforeEach, describe, expect, it } from 'bun:test';
import { AvatarImage, InvalidAvatarError } from '@template/identity-domain';
import { DirectUploads } from '@template/storage';
import { createStorageTestContext, postPresignedForm } from '@template/storage/testing';

import { ObjectStorageAvatarStorage } from './object-storage-avatar-storage.ts';

const context = createStorageTestContext();
const avatars = new ObjectStorageAvatarStorage(context.storage, new DirectUploads(context.storage));
const userId = '0199b0a0-0000-7000-8000-000000000001';
// The smallest valid WebP header is enough: only the signature is checked.
const WEBP = new Uint8Array([
  ...new TextEncoder().encode('RIFF'),
  26,
  0,
  0,
  0,
  ...new TextEncoder().encode('WEBPVP8 '),
]);

beforeEach(async () => {
  await context.reset();
});

afterAll(() => {
  context.close();
});

describe('ObjectStorageAvatarStorage against RustFS', () => {
  it('goes from ticket to browser upload to a cacheable display URL', async () => {
    const ticket = await avatars.issueUpload(
      userId,
      AvatarImage.create('image/webp', WEBP.byteLength),
    );
    expect((await postPresignedForm(ticket, new Blob([WEBP]))).status).toBe(204);

    const key = await avatars.keep(userId, ticket.uploadId);
    const url = await avatars.urlOf(key);

    expect(await avatars.urlOf(key)).toBe(url);
    const response = await fetch(url);
    expect(response.headers.get('content-type')).toBe('image/webp');
    expect(response.headers.get('cache-control')).toBe('private, max-age=31536000, immutable');
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(WEBP);

    await avatars.delete(key);
    expect((await fetch(url)).status).toBe(404);
  });

  it('deletes a file that is not the picture it was announced as', async () => {
    const text = new TextEncoder().encode('definitely not a webp');
    const ticket = await avatars.issueUpload(
      userId,
      AvatarImage.create('image/webp', text.byteLength),
    );
    await postPresignedForm(ticket, new Blob([text]));

    await expect(avatars.keep(userId, ticket.uploadId)).rejects.toBeInstanceOf(InvalidAvatarError);
    expect((await context.storage.list()).objects).toEqual([]);
  });
});
