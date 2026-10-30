import { z } from 'zod';

import { VIDEO_CONTENT_TYPES, VIDEO_MAX_BYTES } from '../video.rules.ts';

/** The video the browser is about to send: the storage will accept exactly this. */
export const videoUploadRequestSchema = z.object({
  contentType: z.enum(VIDEO_CONTENT_TYPES, 'validation.video.contentType'),
  size: z
    .number('validation.video.empty')
    .int('validation.video.empty')
    .min(1, 'validation.video.empty')
    .max(VIDEO_MAX_BYTES, 'validation.video.tooLarge'),
});

export type VideoUploadRequest = z.infer<typeof videoUploadRequestSchema>;
