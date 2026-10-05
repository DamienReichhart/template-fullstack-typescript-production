import { Command } from '@nestjs/cqrs';

export class VerifyEmailCommand extends Command<void> {
  constructor(readonly token: string) {
    super();
  }
}
