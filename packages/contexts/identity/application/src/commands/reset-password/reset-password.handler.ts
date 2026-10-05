import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { Clock, UnitOfWork } from '@template/ddd';
import {
  InvalidOrExpiredTokenError,
  OneTimeTokenRepository,
  PasswordHash,
  SessionRepository,
  UserRepository,
} from '@template/identity-domain';

import { PasswordHasher } from '../../ports/security/password-hasher.port.js';
import { SecureTokenGenerator } from '../../ports/security/secure-token-generator.port.js';
import { ResetPasswordCommand } from './reset-password.command.js';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand, void> {
  constructor(
    private readonly tokens: OneTimeTokenRepository,
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
    private readonly hasher: PasswordHasher,
    private readonly secureTokens: SecureTokenGenerator,
    private readonly unitOfWork: UnitOfWork,
    private readonly clock: Clock,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ token, password }: ResetPasswordCommand): Promise<void> {
    const issued = await this.tokens.findByHash(this.secureTokens.hash(token), 'PASSWORD_RESET');
    const user = issued ? await this.users.findById(issued.userId) : null;
    if (!issued || !user) throw new InvalidOrExpiredTokenError();

    const now = this.clock.now();
    issued.consume(now);
    user.changePassword(PasswordHash.fromHash(await this.hasher.hash(password)), now);

    await this.unitOfWork.run(async () => {
      await this.tokens.save(issued);
      await this.tokens.consumeAllFor(user.id, 'PASSWORD_RESET', now);
      await this.users.save(user);
      await this.sessions.revokeAllForUser(user.id, now);
    });
    this.eventBus.publishAll(user.pullDomainEvents());
  }
}
