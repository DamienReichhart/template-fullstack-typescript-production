import { z } from 'zod';

export const videoStatusSchema = z.enum(['PROCESSING', 'READY', 'FAILED']);
export const videoFailureReasonSchema = z.enum(['unreadable', 'too-long', 'processing-failed']);

export const videoResponseSchema = z.object({
  id: z.uuid(),
  /** PROCESSING while it is transcoded (minutes): poll until READY or FAILED. */
  status: videoStatusSchema,
  failureReason: videoFailureReasonSchema.nullable(),
  /** Playback URL of the H.264 MP4, valid at least six hours; null until READY. */
  url: z.url().nullable(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  durationSeconds: z.number().nullable(),
  createdAt: z.iso.datetime(),
});

export const videoListResponseSchema = z.object({ videos: z.array(videoResponseSchema) });

export type VideoStatus = z.infer<typeof videoStatusSchema>;
export type VideoFailureReason = z.infer<typeof videoFailureReasonSchema>;
export type VideoResponse = z.infer<typeof videoResponseSchema>;
export type VideoListResponse = z.infer<typeof videoListResponseSchema>;
