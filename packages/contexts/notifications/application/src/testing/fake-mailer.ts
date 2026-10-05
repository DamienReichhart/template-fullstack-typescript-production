import type { EmailMessage } from '../models/email-message.js';
import { Mailer } from '../ports/mailer.port.js';

export class FakeMailer extends Mailer {
  readonly sent: EmailMessage[] = [];
  #nextError: Error | undefined;

  failNext(error: Error): void {
    this.#nextError = error;
  }

  async send(message: EmailMessage): Promise<void> {
    const error = this.#nextError;
    this.#nextError = undefined;
    if (error) throw error;
    this.sent.push(message);
  }
}
