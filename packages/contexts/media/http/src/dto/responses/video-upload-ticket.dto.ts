import { videoUploadResponseSchema, type VideoUploadResponse } from '@template/contracts/media';
import { createZodDto } from '@template/http';
import type { VideoUploadTicket } from '@template/media-application';

export class VideoUploadTicketDto extends createZodDto(videoUploadResponseSchema) {}

export function toVideoUploadTicketDto(ticket: VideoUploadTicket): VideoUploadResponse {
  return { ...ticket, expiresAt: ticket.expiresAt.toISOString() };
}
