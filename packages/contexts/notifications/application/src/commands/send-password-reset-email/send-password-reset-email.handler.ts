import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Clock } from '@template/ddd';

import { EmailRenderer } from '../../ports/email-renderer.port.ts';
import { Mailer } from '../../ports/mailer.port.ts';
import { WebLinks } from '../../ports/web-links.port.ts';
import { SendPasswordResetEmailCommand } from './send-password-reset-email.command.ts';

const MINUTE = 60_000;

@CommandHandler(SendPasswordResetEmailCommand)
export class SendPasswordResetEmailHandler implements ICommandHandler<
  SendPasswordResetEmailCommand,
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
  }: SendPasswordResetEmailCommand): Promise<void> {
    const rendered = await this.renderer.render({
      kind: 'reset-password',
      locale,
      name,
      resetUrl: this.links.resetPassword(locale, token),
      expiresInMinutes: Math.max(
        1,
        Math.round((expiresAt.getTime() - this.clock.now().getTime()) / MINUTE),
      ),
    });
    await this.mailer.send({ to: email, ...rendered, idempotencyKey, tag: 'reset-password' });
  }
}
