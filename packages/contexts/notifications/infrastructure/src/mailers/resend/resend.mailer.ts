import type { EmailMessage } from '@template/notifications-application';
import { Mailer } from '@template/notifications-application';
import type { Resend } from 'resend';

export class MailDeliveryError extends Error {
  constructor(reason: string) {
    super(`Email delivery failed: ${reason}`);
    this.name = 'MailDeliveryError';
  }
}

/**
 * Delivers through Resend. The idempotency key makes a retried job a no-op on Resend's
 * side, so a worker crash after sending never emails the user twice.
 */
export class ResendMailer extends Mailer {
  constructor(
    private readonly client: Pick<Resend, 'emails'>,
    private readonly from: string,
  ) {
    super();
  }

  async send(message: EmailMessage): Promise<void> {
    const { error } = await this.client.emails.send(
      {
        from: this.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        tags: [{ name: 'type', value: message.tag }],
      },
      message.idempotencyKey ? { idempotencyKey: message.idempotencyKey } : undefined,
    );
    if (error) throw new MailDeliveryError(`${error.name}: ${error.message}`);
  }
}
