import { z } from 'zod';

export const uploadVideoRequestSchema = z.object({
  uploadId: z.uuid('validation.generic.invalid'),
});

export type UploadVideoRequest = z.infer<typeof uploadVideoRequestSchema>;
