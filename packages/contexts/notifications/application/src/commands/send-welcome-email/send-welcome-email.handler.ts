import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import { EmailRenderer } from '../../ports/email-renderer.port.ts';
import { Mailer } from '../../ports/mailer.port.ts';
import { WebLinks } from '../../ports/web-links.port.ts';
import { SendWelcomeEmailCommand } from './send-welcome-email.command.ts';

@CommandHandler(SendWelcomeEmailCommand)
export class SendWelcomeEmailHandler implements ICommandHandler<SendWelcomeEmailCommand, void> {
  constructor(
    private readonly renderer: EmailRenderer,
    private readonly mailer: Mailer,
    private readonly links: WebLinks,
  ) {}

  async execute({ email, name, locale, idempotencyKey }: SendWelcomeEmailCommand): Promise<void> {
    const rendered = await this.renderer.render({
      kind: 'welcome',
      locale,
      name,
      appUrl: this.links.home(locale),
    });
    await this.mailer.send({ to: email, ...rendered, idempotencyKey, tag: 'welcome' });
  }
}
