import { describe, expect, it } from 'bun:test';

import { createMediaTestKit, OTHER_OWNER_ID, OWNER_ID } from '../../testing/media-test-kit.ts';
import { ListVideosHandler } from './list-videos.handler.ts';
import { ListVideosQuery } from './list-videos.query.ts';

describe('ListVideosHandler', () => {
  it("lists the Owner's Videos only, newest first", async () => {
    const kit = createMediaTestKit();
    const older = await kit.givenVideo();
    kit.clock.advanceBy(1000);
    await kit.givenVideo(OTHER_OWNER_ID);
    const newer = await kit.givenVideo();

    const views = await new ListVideosHandler(kit.videos, kit.views).execute(
      new ListVideosQuery(OWNER_ID),
    );

    expect(views.map((view) => view.id)).toEqual([newer.id.value, older.id.value]);
  });
});
