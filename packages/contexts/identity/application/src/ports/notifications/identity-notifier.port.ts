export interface Recipient {
  email: string;
  name: string;
  locale: string;
}

/**
 * Asks for emails to be sent. Identity decides *that* an email is needed; how it is
 * written and delivered belongs to the notifications context, reached through the queue.
 */
export abstract class IdentityNotifier {
  abstract sendWelcome(recipient: Recipient): Promise<void>;
  abstract sendEmailVerification(
    recipient: Recipient,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  abstract sendPasswordReset(recipient: Recipient, token: string, expiresAt: Date): Promise<void>;
}
