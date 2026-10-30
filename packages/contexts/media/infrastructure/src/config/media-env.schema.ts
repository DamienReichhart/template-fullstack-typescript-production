import { tmpdir } from 'node:os';

import { defineConfig } from '@template/config';
import { z } from 'zod';

export const mediaConfig = defineConfig(
  'media',
  z.object({
    /** ffmpeg built with libx264 and zimg (`zscale`, for HDR tone mapping). */
    FFMPEG_PATH: z.string().min(1).default('ffmpeg'),
    FFPROBE_PATH: z.string().min(1).default('ffprobe'),
    /**
     * Where the worker keeps a Source and its Playable file while transcoding: room for both,
     * a few gigabytes for a long 4K video. Emptied after every job.
     */
    MEDIA_SCRATCH_DIR: z.string().min(1).default(tmpdir()),
  }),
);
