import { Command } from '@nestjs/cqrs';

/** A User stops showing an Avatar. Idempotent. */
export class RemoveAvatarCommand extends Command<void> {
  constructor(readonly userId: string) {
    super();
  }
}
