import { Injectable } from '@nestjs/common';
import { addHours, Clock, UnitOfWork } from '@template/ddd';
import { OneTimeToken, OneTimeTokenRepository, type User } from '@template/identity-domain';

import { IdentitySettings } from '../ports/configuration/identity-settings.port.js';
import { IdentityNotifier } from '../ports/notifications/identity-notifier.port.js';
import { SecureTokenGenerator } from '../ports/security/secure-token-generator.port.js';

/** Issues a fresh email-verification token (voiding older ones) and asks for the email. */
@Injectable()
export class VerificationEmailSender {
  constructor(
    private readonly tokens: OneTimeTokenRepository,
    private readonly secureTokens: SecureTokenGenerator,
    private readonly notifier: IdentityNotifier,
    private readonly settings: IdentitySettings,
    private readonly unitOfWork: UnitOfWork,
    private readonly clock: Clock,
  ) {}

  async send(user: User): Promise<void> {
    const now = this.clock.now();
    const secret = this.secureTokens.generate();
    const token = OneTimeToken.issue({
      userId: user.id,
      purpose: 'EMAIL_VERIFICATION',
      tokenHash: secret.hash,
      expiresAt: addHours(now, this.settings.emailVerificationTtlHours),
      now,
    });

    await this.unitOfWork.run(async () => {
      await this.tokens.consumeAllFor(user.id, 'EMAIL_VERIFICATION', now);
      await this.tokens.save(token);
    });
    await this.notifier.sendEmailVerification(
      { email: user.email.value, name: user.name, locale: user.locale },
      secret.token,
      token.expiresAt,
    );
  }
}
