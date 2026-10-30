import { Command } from '@nestjs/cqrs';

import type { VideoUploadTicket } from '../../ports/storage/video-storage.port.ts';

/** An Owner announces the Video they are about to send: its format and size in bytes. */
export class RequestVideoUploadCommand extends Command<VideoUploadTicket> {
  constructor(
    readonly ownerId: string,
    readonly contentType: string,
    readonly size: number,
  ) {
    super();
  }
}
