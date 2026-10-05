import { Command } from '@nestjs/cqrs';

/** Always succeeds, whether or not the email exists: nothing to learn by probing it. */
export class RequestPasswordResetCommand extends Command<void> {
  constructor(readonly email: string) {
    super();
  }
}
