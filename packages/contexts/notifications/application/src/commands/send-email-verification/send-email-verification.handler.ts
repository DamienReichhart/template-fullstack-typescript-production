import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Clock } from '@template/ddd';

import { EmailRenderer } from '../../ports/email-renderer.port.js';
import { Mailer } from '../../ports/mailer.port.js';
import { WebLinks } from '../../ports/web-links.port.js';
import { SendEmailVerificationCommand } from './send-email-verification.command.js';

const HOUR = 3_600_000;

@CommandHandler(SendEmailVerificationCommand)
export class SendEmailVerificationHandler implements ICommandHandler<
  SendEmailVerificationCommand,
  void
> {
  constructor(
    private readonly renderer: EmailRenderer,
    private readonly mailer: Mailer,
    private readonly links: WebLinks,
    private readonly clock: Clock,
  ) {}

  async execute({
    email,
    name,
    locale,
    token,
    expiresAt,
    idempotencyKey,
  }: SendEmailVerificationCommand): Promise<void> {
    const rendered = await this.renderer.render({
      kind: 'verify-email',
      locale,
      name,
      verificationUrl: this.links.verifyEmail(locale, token),
      expiresInHours: Math.max(
        1,
        Math.round((expiresAt.getTime() - this.clock.now().getTime()) / HOUR),
      ),
    });
    await this.mailer.send({ to: email, ...rendered, idempotencyKey, tag: 'verify-email' });
  }
}
