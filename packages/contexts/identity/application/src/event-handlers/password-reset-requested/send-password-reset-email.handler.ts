import { Logger } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { addMinutes, Clock, UnitOfWork } from '@template/ddd';
import {
  OneTimeToken,
  OneTimeTokenRepository,
  PasswordResetRequestedEvent,
  UserId,
  UserRepository,
} from '@template/identity-domain';

import { IdentitySettings } from '../../ports/configuration/identity-settings.port.ts';
import { IdentityNotifier } from '../../ports/notifications/identity-notifier.port.ts';
import { SecureTokenGenerator } from '../../ports/security/secure-token-generator.port.ts';

/** Policy: when a password reset is requested, email a fresh single-use reset link. */
@EventsHandler(PasswordResetRequestedEvent)
export class SendPasswordResetEmailHandler implements IEventHandler<PasswordResetRequestedEvent> {
  private readonly logger = new Logger(SendPasswordResetEmailHandler.name);

  constructor(
    private readonly users: UserRepository,
    private readonly tokens: OneTimeTokenRepository,
    private readonly secureTokens: SecureTokenGenerator,
    private readonly notifier: IdentityNotifier,
    private readonly settings: IdentitySettings,
    private readonly unitOfWork: UnitOfWork,
    private readonly clock: Clock,
  ) {}

  async handle(event: PasswordResetRequestedEvent): Promise<void> {
    try {
      const user = await this.users.findById(UserId.from(event.userId));
      if (!user) return;

      const now = this.clock.now();
      const secret = this.secureTokens.generate();
      const token = OneTimeToken.issue({
        userId: user.id,
        purpose: 'PASSWORD_RESET',
        tokenHash: secret.hash,
        expiresAt: addMinutes(now, this.settings.passwordResetTtlMinutes),
        now,
      });
      await this.unitOfWork.run(async () => {
        await this.tokens.consumeAllFor(user.id, 'PASSWORD_RESET', now);
        await this.tokens.save(token);
      });
      await this.notifier.sendPasswordReset(
        { email: user.email.value, name: user.name, locale: user.locale },
        secret.token,
        token.expiresAt,
      );
    } catch (error) {
      this.logger.error(
        { err: error, userId: event.userId },
        'Could not send the password reset email',
      );
    }
  }
}
