import { describe, expect, it } from 'bun:test';
import { PlayableFile, VideoNotFoundError } from '@template/media-domain';

import { createMediaTestKit, OTHER_OWNER_ID, OWNER_ID } from '../../testing/media-test-kit.ts';
import { GetVideoHandler } from './get-video.handler.ts';
import { GetVideoQuery } from './get-video.query.ts';

describe('GetVideoHandler', () => {
  it('shows a Processing Video without a URL', async () => {
    const kit = createMediaTestKit();
    const video = await kit.givenVideo();

    const view = await new GetVideoHandler(kit.videos, kit.views).execute(
      new GetVideoQuery(OWNER_ID, video.id.value),
    );

    expect(view).toEqual({
      id: video.id.value,
      status: 'PROCESSING',
      failureReason: null,
      url: null,
      width: null,
      height: null,
      durationSeconds: null,
      createdAt: kit.clock.now(),
    });
  });

  it('resolves the URL of a Ready Video', async () => {
    const kit = createMediaTestKit();
    const video = await kit.givenVideo();
    const key = kit.storage.playableKeyOf(OWNER_ID, video.id.value);
    video.markReady(
      PlayableFile.of({ key, size: 1, width: 1080, height: 1920, durationSeconds: 3 }),
      kit.clock.now(),
    );
    await kit.videos.save(video);

    const view = await new GetVideoHandler(kit.videos, kit.views).execute(
      new GetVideoQuery(OWNER_ID, video.id.value),
    );

    expect(view).toMatchObject({ status: 'READY', url: `https://storage.test/bucket/${key}` });
    expect(view).toMatchObject({ width: 1080, height: 1920, durationSeconds: 3 });
  });

  it("does not find another User's Video", async () => {
    const kit = createMediaTestKit();
    const video = await kit.givenVideo(OTHER_OWNER_ID);

    await expect(
      new GetVideoHandler(kit.videos, kit.views).execute(
        new GetVideoQuery(OWNER_ID, video.id.value),
      ),
    ).rejects.toBeInstanceOf(VideoNotFoundError);
  });
});
