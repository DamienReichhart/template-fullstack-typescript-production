import {
  IdentityNotifier,
  type Recipient,
} from '../../ports/notifications/identity-notifier.port.js';

export type SentNotification =
  | { kind: 'welcome'; recipient: Recipient }
  | { kind: 'email-verification'; recipient: Recipient; token: string; expiresAt: Date }
  | { kind: 'password-reset'; recipient: Recipient; token: string; expiresAt: Date };

export class FakeIdentityNotifier extends IdentityNotifier {
  readonly sent: SentNotification[] = [];

  async sendWelcome(recipient: Recipient): Promise<void> {
    this.sent.push({ kind: 'welcome', recipient });
  }

  async sendEmailVerification(recipient: Recipient, token: string, expiresAt: Date): Promise<void> {
    this.sent.push({ kind: 'email-verification', recipient, token, expiresAt });
  }

  async sendPasswordReset(recipient: Recipient, token: string, expiresAt: Date): Promise<void> {
    this.sent.push({ kind: 'password-reset', recipient, token, expiresAt });
  }

  last<Kind extends SentNotification['kind']>(
    kind: Kind,
  ): Extract<SentNotification, { kind: Kind }> | undefined {
    return this.sent.filter((notification) => notification.kind === kind).at(-1) as
      Extract<SentNotification, { kind: Kind }> | undefined;
  }
}
