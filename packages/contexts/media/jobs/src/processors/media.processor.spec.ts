import 'reflect-metadata';

import { describe, expect, it, mock } from 'bun:test';
import type { CommandBus } from '@nestjs/cqrs';
import { TranscodeVideoCommand } from '@template/media-application';
import type { Job } from 'bullmq';

import { MediaProcessor } from './media.processor.ts';

const videoId = '0199b0a0-0000-7000-8000-0000000000aa';

const job = (attemptsMade: number) =>
  ({
    name: 'transcode-video',
    data: { videoId },
    id: `transcode-video-${videoId}`,
    queueName: 'media',
    attemptsMade,
    opts: { attempts: 3 },
  }) as unknown as Job;

describe('MediaProcessor', () => {
  it('transcodes the video, telling the command whether a retry follows', async () => {
    const execute = mock(async () => undefined);
    const processor = new MediaProcessor({ execute } as unknown as CommandBus);

    await processor.process(job(0));
    await processor.process(job(2));

    expect(execute.mock.calls.map((call) => (call as unknown[])[0])).toEqual([
      new TranscodeVideoCommand(videoId, false),
      new TranscodeVideoCommand(videoId, true),
    ]);
  });

  it('runs one transcode at a time', () => {
    expect(new MediaProcessor({} as CommandBus).concurrency).toBe(1);
  });
});
