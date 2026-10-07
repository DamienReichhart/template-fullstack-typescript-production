import { Command } from '@nestjs/cqrs';

import type { AvatarUploadTicket } from '../../ports/storage/avatar-storage.port.ts';

/** A User announces the picture they are about to send: its format and size in bytes. */
export class RequestAvatarUploadCommand extends Command<AvatarUploadTicket> {
  constructor(
    readonly userId: string,
    readonly contentType: string,
    readonly size: number,
  ) {
    super();
  }
}
