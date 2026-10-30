import { describe, expect, it } from 'bun:test';
import { InvalidVideoError, VideoFile, VideoUploadNotFoundError } from '@template/media-domain';
import { DirectUploads } from '@template/storage';
import { InMemoryObjectStorage } from '@template/storage/testing';

import { ObjectStorageVideoStorage } from './object-storage-video-storage.ts';

const ownerId = '0199b0a0-0000-7000-8000-000000000001';
const videoId = '0199b0a0-0000-7000-8000-0000000000aa';
const MOV = new Uint8Array([0, 0, 0, 0x14, ...new TextEncoder().encode('ftypqt  '), 0, 0, 0, 0]);

function setup() {
  const storage = new InMemoryObjectStorage();
  const videos = new ObjectStorageVideoStorage(storage, new DirectUploads(storage));
  return { storage, videos };
}

describe('ObjectStorageVideoStorage', () => {
  it('keeps a valid upload as the Source of the Video, under the owner prefix', async () => {
    const { storage, videos } = setup();
    const ticket = await videos.issueUpload(
      ownerId,
      VideoFile.create('video/quicktime', MOV.byteLength),
    );
    await storage.completeUpload(ticket.fields, MOV);

    const key = await videos.keepSource(ownerId, ticket.uploadId, videoId);

    expect(key).toBe(`media/sources/${ownerId}/${videoId}`);
    expect(await storage.head(key)).toMatchObject({ contentType: 'video/quicktime' });
    expect(storage.presignedUploads[0]).toMatchObject({ minBytes: 16, maxBytes: 16 });
    expect([...storage.objects.keys()]).toEqual([key]);
  });

  it('translates storage refusals into media errors', async () => {
    const { storage, videos } = setup();
    await expect(videos.keepSource(ownerId, 'nope', videoId)).rejects.toBeInstanceOf(
      VideoUploadNotFoundError,
    );

    const html = new TextEncoder().encode('<html>not a video</html>');
    const ticket = await videos.issueUpload(
      ownerId,
      VideoFile.create('video/mp4', html.byteLength),
    );
    await storage.completeUpload(ticket.fields, html);
    const error = await videos
      .keepSource(ownerId, ticket.uploadId, videoId)
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(InvalidVideoError);
    expect((error as InvalidVideoError).reason).toBe('content-mismatch');
    expect(storage.objects.size).toBe(0);
  });

  it('places Playable files, resolves playback URLs and deletes files', async () => {
    const { storage, videos } = setup();
    const key = videos.playableKeyOf(ownerId, videoId);
    await storage.put(key, MOV, { contentType: 'video/mp4' });

    expect(key).toBe(`media/videos/${ownerId}/${videoId}`);
    expect(await videos.urlOf(key)).toContain(key);
    await videos.delete(key);
    expect(storage.objects.size).toBe(0);
  });
});
