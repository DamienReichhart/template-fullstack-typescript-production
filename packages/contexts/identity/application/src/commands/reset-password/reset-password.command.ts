import { Command } from '@nestjs/cqrs';

/** Sets a new password from a reset link and signs the user out everywhere. */
export class ResetPasswordCommand extends Command<void> {
  constructor(
    readonly token: string,
    readonly password: string,
  ) {
    super();
  }
}
