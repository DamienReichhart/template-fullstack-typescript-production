import { afterAll, beforeEach, describe, expect, it } from 'bun:test';
import { InvalidVideoError, VideoFile } from '@template/media-domain';
import { DirectUploads } from '@template/storage';
import { createStorageTestContext, postPresignedForm } from '@template/storage/testing';

import { ObjectStorageVideoStorage } from './object-storage-video-storage.ts';

const context = createStorageTestContext();
const videos = new ObjectStorageVideoStorage(context.storage, new DirectUploads(context.storage));
const ownerId = '0199b0a0-0000-7000-8000-000000000001';
const videoId = '0199b0a0-0000-7000-8000-0000000000aa';
// An MP4 header is enough: only the signature is checked on upload.
const MP4 = new Uint8Array([0, 0, 0, 0x18, ...new TextEncoder().encode('ftypmp42'), 0, 0, 0, 0]);

beforeEach(async () => {
  await context.reset();
});

afterAll(() => {
  context.close();
});

describe('ObjectStorageVideoStorage against RustFS', () => {
  it('goes from ticket to browser upload to a kept Source', async () => {
    const ticket = await videos.issueUpload(ownerId, VideoFile.create('video/mp4', MP4.byteLength));
    expect((await postPresignedForm(ticket, new Blob([MP4]))).status).toBe(204);

    const key = await videos.keepSource(ownerId, ticket.uploadId, videoId);

    const { objects } = await context.storage.list();
    expect(objects.map((object) => object.key)).toEqual([key]);
    expect(await context.storage.read(key)).toEqual(MP4);
  });

  it('plays a Playable file from a stable URL, then deletes it', async () => {
    const key = videos.playableKeyOf(ownerId, videoId);
    await context.storage.put(key, MP4, { contentType: 'video/mp4' });

    const url = await videos.urlOf(key);
    expect(await videos.urlOf(key)).toBe(url);
    const response = await fetch(url, { headers: { range: 'bytes=4-11' } });
    expect(response.status).toBe(206);
    expect(await response.text()).toBe('ftypmp42');

    await videos.delete(key);
    expect((await fetch(url)).status).toBe(404);
  });

  it('deletes a file that is not the video it was announced as', async () => {
    const text = new TextEncoder().encode('definitely not a video');
    const ticket = await videos.issueUpload(
      ownerId,
      VideoFile.create('video/mp4', text.byteLength),
    );
    await postPresignedForm(ticket, new Blob([text]));

    await expect(videos.keepSource(ownerId, ticket.uploadId, videoId)).rejects.toBeInstanceOf(
      InvalidVideoError,
    );
    expect((await context.storage.list()).objects).toEqual([]);
  });
});
