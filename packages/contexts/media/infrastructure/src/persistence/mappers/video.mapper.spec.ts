import { describe, expect, it } from 'bun:test';
import { OwnerId, PlayableFile, Video, VideoId } from '@template/media-domain';

import { VideoMapper } from './video.mapper.ts';

const now = new Date('2026-01-01T00:00:00.000Z');
const upload = () =>
  Video.upload({
    id: VideoId.create(),
    ownerId: OwnerId.from('0199b0a0-0000-7000-8000-000000000001'),
    sourceKey: 'media/sources/o/v',
    now,
  });

describe('VideoMapper', () => {
  it('round-trips a Ready Video, sizes beyond 2 GB included', () => {
    const video = upload();
    video.markReady(
      PlayableFile.of({
        key: 'media/videos/o/v',
        size: 5 * 1024 ** 3,
        width: 3840,
        height: 2160,
        durationSeconds: 599.97,
      }),
      now,
    );

    const record = VideoMapper.toPersistence(video);
    const reloaded = VideoMapper.toDomain(record);

    expect(record.fileSize).toBe(5n * 1024n ** 3n);
    expect(reloaded.status).toBe('READY');
    expect(reloaded.playableFile).toEqual(video.playableFile);
  });

  it('round-trips a Failed Video without a Playable file', () => {
    const video = upload();
    video.fail('unreadable', now);

    const reloaded = VideoMapper.toDomain(VideoMapper.toPersistence(video));

    expect(reloaded.failureReason).toBe('unreadable');
    expect(reloaded.playableFile).toBeNull();
    expect(reloaded.sourceKey).toBe('media/sources/o/v');
  });
});
