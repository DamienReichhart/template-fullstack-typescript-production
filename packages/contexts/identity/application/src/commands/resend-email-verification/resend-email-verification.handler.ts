import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Email, UserRepository } from '@template/identity-domain';

import { VerificationEmailSender } from '../../services/verification-email.sender.ts';
import { ResendEmailVerificationCommand } from './resend-email-verification.command.ts';

@CommandHandler(ResendEmailVerificationCommand)
export class ResendEmailVerificationHandler implements ICommandHandler<
  ResendEmailVerificationCommand,
  void
> {
  constructor(
    private readonly users: UserRepository,
    private readonly verificationSender: VerificationEmailSender,
  ) {}

  async execute({ email }: ResendEmailVerificationCommand): Promise<void> {
    const user = await this.users.findByEmail(Email.create(email));
    if (!user || user.isEmailVerified) return;
    await this.verificationSender.send(user);
  }
}
