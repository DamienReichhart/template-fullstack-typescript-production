import { describe, expect, it } from 'bun:test';
import {
  InvalidVideoError,
  VideoFile,
  VideoId,
  VideoUploadedEvent,
  VideoUploadNotFoundError,
} from '@template/media-domain';

import { createMediaTestKit, OTHER_OWNER_ID, OWNER_ID } from '../../testing/media-test-kit.ts';
import { UploadVideoCommand } from './upload-video.command.ts';
import { UploadVideoHandler } from './upload-video.handler.ts';

async function setup() {
  const kit = createMediaTestKit();
  const handler = new UploadVideoHandler(
    kit.videos,
    kit.storage,
    kit.clock,
    kit.eventBus.asEventBus(),
  );
  const ticket = await kit.storage.issueUpload(OWNER_ID, VideoFile.create('video/mp4', 10));
  return { kit, handler, uploadId: ticket.uploadId };
}

describe('UploadVideoHandler', () => {
  it('keeps the upload as the Source of a Processing Video, then records VideoUploaded', async () => {
    const { kit, handler, uploadId } = await setup();
    kit.storage.receive(uploadId);

    const videoId = await handler.execute(new UploadVideoCommand(OWNER_ID, uploadId));

    const video = await kit.videos.findById(VideoId.from(videoId));
    expect(video?.status).toBe('PROCESSING');
    expect(video?.sourceKey).toBe(`media/sources/${OWNER_ID}/${videoId}`);
    expect(kit.storage.files.has(`media/sources/${OWNER_ID}/${videoId}`)).toBe(true);
    expect(kit.eventBus.published).toEqual([
      new VideoUploadedEvent(videoId, OWNER_ID, kit.clock.now()),
    ]);
  });

  it('records nothing for an upload that never arrived or belongs to someone else', async () => {
    const { kit, handler, uploadId } = await setup();

    await expect(
      handler.execute(new UploadVideoCommand(OWNER_ID, uploadId)),
    ).rejects.toBeInstanceOf(VideoUploadNotFoundError);
    kit.storage.receive(uploadId);
    await expect(
      handler.execute(new UploadVideoCommand(OTHER_OWNER_ID, uploadId)),
    ).rejects.toBeInstanceOf(VideoUploadNotFoundError);
    expect(kit.videos.videos.size).toBe(0);
    expect(kit.eventBus.published).toEqual([]);
  });

  it('refuses a file that is not the video it was announced as', async () => {
    const { kit, handler, uploadId } = await setup();
    kit.storage.receive(uploadId, { contentType: 'text/html', size: 10 });

    await expect(
      handler.execute(new UploadVideoCommand(OWNER_ID, uploadId)),
    ).rejects.toBeInstanceOf(InvalidVideoError);
    expect(kit.videos.videos.size).toBe(0);
  });
});
