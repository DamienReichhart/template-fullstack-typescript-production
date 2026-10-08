import { z } from 'zod';

export const changeAvatarRequestSchema = z.object({
  uploadId: z.uuid('validation.generic.invalid'),
});

export type ChangeAvatarRequest = z.infer<typeof changeAvatarRequestSchema>;
