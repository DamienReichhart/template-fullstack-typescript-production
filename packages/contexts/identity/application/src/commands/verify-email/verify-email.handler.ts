import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { Clock, UnitOfWork } from '@template/ddd';
import {
  InvalidOrExpiredTokenError,
  OneTimeTokenRepository,
  UserRepository,
} from '@template/identity-domain';

import { SecureTokenGenerator } from '../../ports/security/secure-token-generator.port.ts';
import { VerifyEmailCommand } from './verify-email.command.ts';

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand, void> {
  constructor(
    private readonly tokens: OneTimeTokenRepository,
    private readonly users: UserRepository,
    private readonly secureTokens: SecureTokenGenerator,
    private readonly unitOfWork: UnitOfWork,
    private readonly clock: Clock,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ token }: VerifyEmailCommand): Promise<void> {
    const issued = await this.tokens.findByHash(
      this.secureTokens.hash(token),
      'EMAIL_VERIFICATION',
    );
    const user = issued ? await this.users.findById(issued.userId) : null;
    if (!issued || !user) throw new InvalidOrExpiredTokenError();

    const now = this.clock.now();
    issued.consume(now);
    user.verifyEmail(now);
    await this.unitOfWork.run(async () => {
      await this.tokens.save(issued);
      await this.users.save(user);
    });
    this.eventBus.publishAll(user.pullDomainEvents());
  }
}
