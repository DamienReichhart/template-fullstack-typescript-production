import { FixedClock } from '@template/ddd';
import { OwnerId, Video, VideoId } from '@template/media-domain';

import { VideoViews } from '../services/video-views.service.ts';
import { FakeVideoStorage } from './fakes/fake-video-storage.ts';
import { FakeVideoTranscoder } from './fakes/fake-video-transcoder.ts';
import { FakeVideoTranscoding } from './fakes/fake-video-transcoding.ts';
import { RecordingEventBus } from './fakes/recording-event-bus.ts';
import { InMemoryVideoRepository } from './repositories/in-memory-video.repository.ts';

export const OWNER_ID = '0199b0a0-0000-7000-8000-000000000001';
export const OTHER_OWNER_ID = '0199b0a0-0000-7000-8000-000000000002';

/**
 * Every port of the media application layer, faked and wired together.
 * `createMediaTestKit()` per test keeps tests independent.
 */
export function createMediaTestKit() {
  const clock = new FixedClock();
  const videos = new InMemoryVideoRepository();
  const storage = new FakeVideoStorage();
  const transcoder = new FakeVideoTranscoder(storage);
  const transcoding = new FakeVideoTranscoding();
  const views = new VideoViews(storage);
  const eventBus = new RecordingEventBus();

  /** Persists a Processing Video (events already pulled) whose Source is in `storage`. */
  async function givenVideo(ownerId = OWNER_ID) {
    const id = VideoId.create();
    const sourceKey = `media/sources/${ownerId}/${id.value}`;
    storage.files.add(sourceKey);
    const video = Video.upload({ id, ownerId: OwnerId.from(ownerId), sourceKey, now: clock.now() });
    video.pullDomainEvents();
    await videos.save(video);
    return video;
  }

  return { clock, videos, storage, transcoder, transcoding, views, eventBus, givenVideo };
}

export type MediaTestKit = ReturnType<typeof createMediaTestKit>;
