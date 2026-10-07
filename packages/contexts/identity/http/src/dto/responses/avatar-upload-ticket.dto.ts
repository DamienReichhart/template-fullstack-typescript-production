import {
  avatarUploadResponseSchema,
  type AvatarUploadResponse,
} from '@template/contracts/identity';
import { createZodDto } from '@template/http';
import type { AvatarUploadTicket } from '@template/identity-application';

export class AvatarUploadTicketDto extends createZodDto(avatarUploadResponseSchema) {}

export function toAvatarUploadTicketDto(ticket: AvatarUploadTicket): AvatarUploadResponse {
  return { ...ticket, expiresAt: ticket.expiresAt.toISOString() };
}
