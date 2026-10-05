import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Clock } from '@template/ddd';
import { RefreshTokenHash, SessionRepository } from '@template/identity-domain';

import { SecureTokenGenerator } from '../../ports/security/secure-token-generator.port.ts';
import { LogoutCommand } from './logout.command.ts';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly secureTokens: SecureTokenGenerator,
    private readonly clock: Clock,
  ) {}

  async execute({ refreshToken }: LogoutCommand): Promise<void> {
    if (!refreshToken) return;
    const session = await this.sessions.findByRefreshTokenHash(
      RefreshTokenHash.fromHash(this.secureTokens.hash(refreshToken)),
    );
    if (!session) return;
    session.revoke(this.clock.now());
    await this.sessions.save(session);
  }
}
