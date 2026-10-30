import { describe, expect, it } from 'bun:test';
import { VideoUploadedEvent } from '@template/media-domain';

import { FakeVideoTranscoding } from '../../testing/fakes/fake-video-transcoding.ts';
import { OWNER_ID } from '../../testing/media-test-kit.ts';
import { ScheduleTranscodingHandler } from './schedule-transcoding.handler.ts';

const now = new Date('2026-01-01T00:00:00Z');

describe('ScheduleTranscodingHandler', () => {
  it('schedules the transcoding of the uploaded Video', async () => {
    const transcoding = new FakeVideoTranscoding();

    await new ScheduleTranscodingHandler(transcoding).handle(
      new VideoUploadedEvent('v1', OWNER_ID, now),
    );

    expect(transcoding.scheduled).toEqual(['v1']);
  });

  it('never fails the upload when the job cannot be enqueued', async () => {
    const transcoding = new FakeVideoTranscoding();
    transcoding.schedule = async () => {
      throw new Error('redis down');
    };

    await new ScheduleTranscodingHandler(transcoding).handle(
      new VideoUploadedEvent('v1', OWNER_ID, now),
    );
  });
});
