import type { EmailMessage } from '../models/email-message.ts';

/** Delivers a rendered email. Throws on failure so the job is retried. */
export abstract class Mailer {
  abstract send(message: EmailMessage): Promise<void>;
}
