import { Logger } from '@nestjs/common';
import { Mailer, type EmailMessage } from '@template/notifications-application';

/**
 * Logs emails instead of sending them. The plain-text body (with its links) is logged at
 * debug level only: one-time tokens must not reach production logs.
 */
export class ConsoleMailer extends Mailer {
  private readonly logger = new Logger('ConsoleMailer');

  async send(message: EmailMessage): Promise<void> {
    this.logger.log(
      { to: message.to, subject: message.subject, tag: message.tag },
      'Email not sent (console transport)',
    );
    this.logger.debug(message.text);
  }
}
