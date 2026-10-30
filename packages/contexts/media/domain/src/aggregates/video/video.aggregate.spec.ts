import { describe, expect, it } from 'bun:test';

import { VideoNotProcessingError } from './errors/video-not-processing.error.ts';
import { VideoUploadedEvent } from './events/video-uploaded.event.ts';
import { OwnerId } from './value-objects/owner-id.value-object.ts';
import { PlayableFile } from './value-objects/playable-file.value-object.ts';
import { VideoId } from './value-objects/video-id.value-object.ts';
import { Video } from './video.aggregate.ts';

const ownerId = OwnerId.from('0199b0a0-0000-7000-8000-000000000001');
const now = new Date('2026-01-01T00:00:00.000Z');
const later = new Date('2026-01-01T00:05:00.000Z');
const file = PlayableFile.of({
  key: 'media/videos/o/v',
  size: 1024,
  width: 1920,
  height: 1080,
  durationSeconds: 12.5,
});

const upload = () =>
  Video.upload({ id: VideoId.create(), ownerId, sourceKey: 'media/sources/o/v', now });

describe('Video', () => {
  it('starts Processing and records VideoUploaded', () => {
    const video = upload();

    expect(video.status).toBe('PROCESSING');
    expect(video.playableFile).toBeNull();
    expect(video.isOwnedBy(ownerId)).toBe(true);
    const events = video.pullDomainEvents();
    expect(events).toEqual([new VideoUploadedEvent(video.id.value, ownerId.value, now)]);
  });

  it('becomes Ready with its Playable file', () => {
    const video = upload();
    video.markReady(file, later);

    expect(video.status).toBe('READY');
    expect(video.playableFile?.equals(file)).toBe(true);
    expect(video.failureReason).toBeNull();
    expect(video.updatedAt).toEqual(later);
  });

  it('fails with a reason', () => {
    const video = upload();
    video.fail('too-long', later);

    expect(video.status).toBe('FAILED');
    expect(video.failureReason).toBe('too-long');
    expect(video.playableFile).toBeNull();
  });

  it('settles only once', () => {
    const ready = upload();
    ready.markReady(file, later);
    expect(() => ready.fail('processing-failed', later)).toThrow(VideoNotProcessingError);

    const failed = upload();
    failed.fail('unreadable', later);
    expect(() => failed.markReady(file, later)).toThrow(VideoNotProcessingError);
  });
});
