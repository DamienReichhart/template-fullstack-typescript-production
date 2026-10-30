import { describe, expect, it, mock } from 'bun:test';
import type { JobProducer } from '@template/messaging';
import { transcodeVideoJob } from '@template/queue';

import { BullMqVideoTranscoding } from './bullmq-video-transcoding.ts';

const videoId = '0199b0a0-0000-7000-8000-0000000000aa';

describe('BullMqVideoTranscoding', () => {
  it('enqueues one transcode job per video, with a payload the job contract accepts', async () => {
    const enqueue = mock(async () => 'job-id');
    const transcoding = new BullMqVideoTranscoding({ enqueue } as unknown as JobProducer);

    await transcoding.schedule(videoId);

    expect(enqueue).toHaveBeenCalledWith(
      transcodeVideoJob,
      { videoId },
      { jobId: `transcode-video-${videoId}` },
    );
    expect(transcodeVideoJob.schema.safeParse({ videoId }).success).toBe(true);
    expect(transcodeVideoJob.schema.safeParse({ videoId: 'nope' }).success).toBe(false);
  });
});
