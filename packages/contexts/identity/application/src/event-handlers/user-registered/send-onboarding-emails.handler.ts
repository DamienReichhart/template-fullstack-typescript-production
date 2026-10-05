import { Logger } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { UserId, UserRegisteredEvent, UserRepository } from '@template/identity-domain';

import { IdentityNotifier } from '../../ports/notifications/identity-notifier.port.js';
import { VerificationEmailSender } from '../../services/verification-email.sender.js';

/**
 * Policy: when a user registers, welcome them and ask them to verify their email.
 * Runs after the registration committed; a failure here never undoes the registration
 * (the user can ask for a new verification email).
 */
@EventsHandler(UserRegisteredEvent)
export class SendOnboardingEmailsHandler implements IEventHandler<UserRegisteredEvent> {
  private readonly logger = new Logger(SendOnboardingEmailsHandler.name);

  constructor(
    private readonly users: UserRepository,
    private readonly notifier: IdentityNotifier,
    private readonly verificationSender: VerificationEmailSender,
  ) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    try {
      const user = await this.users.findById(UserId.from(event.userId));
      if (!user) return;
      await this.notifier.sendWelcome({
        email: user.email.value,
        name: user.name,
        locale: user.locale,
      });
      await this.verificationSender.send(user);
    } catch (error) {
      this.logger.error({ err: error, userId: event.userId }, 'Could not send onboarding emails');
    }
  }
}
