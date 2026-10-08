import { Command } from '@nestjs/cqrs';

/** Housekeeping: deletes the file of an Avatar that was replaced or removed. */
export class DeleteAvatarFileCommand extends Command<void> {
  constructor(readonly avatarKey: string) {
    super();
  }
}
