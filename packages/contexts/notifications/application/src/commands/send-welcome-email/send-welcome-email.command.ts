import { Command } from '@nestjs/cqrs';

export class SendWelcomeEmailCommand extends Command<void> {
  constructor(
    readonly email: string,
    readonly name: string,
    readonly locale: string,
    readonly idempotencyKey?: string,
  ) {
    super();
  }
}
