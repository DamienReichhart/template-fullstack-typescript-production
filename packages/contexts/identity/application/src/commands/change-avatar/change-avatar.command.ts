import { Command } from '@nestjs/cqrs';

/** A User shows the picture they sent under `uploadId` as their Avatar. */
export class ChangeAvatarCommand extends Command<void> {
  constructor(
    readonly userId: string,
    readonly uploadId: string,
  ) {
    super();
  }
}
