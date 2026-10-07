import { z } from 'zod';

import { AVATAR_CONTENT_TYPES, AVATAR_MAX_BYTES } from '../avatar.rules.ts';

/** The picture the browser is about to send: the storage will accept exactly this. */
export const avatarUploadRequestSchema = z.object({
  contentType: z.enum(AVATAR_CONTENT_TYPES, 'validation.avatar.contentType'),
  size: z
    .number('validation.avatar.empty')
    .int('validation.avatar.empty')
    .min(1, 'validation.avatar.empty')
    .max(AVATAR_MAX_BYTES, 'validation.avatar.tooLarge'),
});

export type AvatarUploadRequest = z.infer<typeof avatarUploadRequestSchema>;
