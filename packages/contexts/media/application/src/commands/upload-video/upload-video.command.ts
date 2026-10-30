import { Command } from '@nestjs/cqrs';

/** The Owner sent the file of `uploadId`: it becomes a Video, Processing. Returns its id. */
export class UploadVideoCommand extends Command<string> {
  constructor(
    readonly ownerId: string,
    readonly uploadId: string,
  ) {
    super();
  }
}
