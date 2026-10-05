import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import { EmailRenderer } from '../../ports/email-renderer.port.js';
import { Mailer } from '../../ports/mailer.port.js';
import { WebLinks } from '../../ports/web-links.port.js';
import { SendWelcomeEmailCommand } from './send-welcome-email.command.js';

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
