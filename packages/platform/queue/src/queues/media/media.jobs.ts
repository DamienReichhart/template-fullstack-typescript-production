import { z } from 'zod';

import { defineJob } from '../../core/define-job.ts';
import { mediaQueue } from './media.queue.ts';

/**
 * Transcodes an uploaded Video into its Playable file. A few spaced retries ride out a storage
 * or worker restart; the last attempt fails the Video instead of retrying forever.
 */
export const transcodeVideoJob = defineJob(
  mediaQueue,
  'transcode-video',
  z.object({ videoId: z.uuid() }),
  { attempts: 3, backoff: { type: 'exponential', delay: 30_000 } },
);
