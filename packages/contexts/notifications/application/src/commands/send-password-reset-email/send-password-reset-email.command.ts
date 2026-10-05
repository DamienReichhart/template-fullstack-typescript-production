import { Command } from '@nestjs/cqrs';

export class SendPasswordResetEmailCommand extends Command<void> {
  constructor(
    readonly email: string,
    readonly name: string,
    readonly locale: string,
    readonly token: string,
    readonly expiresAt: Date,
    readonly idempotencyKey?: string,
  ) {
    super();
  }
}
