import { Command } from '@nestjs/cqrs';

/** Revokes the session of the refresh token. Idempotent: unknown tokens are ignored. */
export class LogoutCommand extends Command<void> {
  constructor(readonly refreshToken: string | undefined) {
    super();
  }
}
