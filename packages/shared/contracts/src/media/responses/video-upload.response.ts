import { z } from 'zod';

/**
 * An HTML form upload straight to object storage: POST `fields`, then the file as the last
 * field named `file`, as `multipart/form-data` to `url`, without credentials. Then
 * `POST /videos` with the `uploadId`.
 */
export const videoUploadResponseSchema = z.object({
  uploadId: z.uuid(),
  url: z.url(),
  fields: z.record(z.string(), z.string()),
  expiresAt: z.iso.datetime(),
});

export type VideoUploadResponse = z.infer<typeof videoUploadResponseSchema>;
