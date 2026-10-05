import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Clock } from '@template/ddd';
import {
  RefreshTokenHash,
  RefreshTokenReuseDetectedError,
  SessionRepository,
  SessionRevokedError,
  UserRepository,
} from '@template/identity-domain';

import { SecureTokenGenerator } from '../../ports/security/secure-token-generator.port.ts';
import { SessionIssuer } from '../../services/session-issuer.service.ts';
import type { AuthSessionView } from '../../views/auth-session.view.ts';
import { RefreshSessionCommand } from './refresh-session.command.ts';

@CommandHandler(RefreshSessionCommand)
export class RefreshSessionHandler implements ICommandHandler<
  RefreshSessionCommand,
  AuthSessionView
> {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly users: UserRepository,
    private readonly secureTokens: SecureTokenGenerator,
    private readonly sessionIssuer: SessionIssuer,
    private readonly clock: Clock,
  ) {}

  async execute({ refreshToken }: RefreshSessionCommand): Promise<AuthSessionView> {
    const presented = RefreshTokenHash.fromHash(this.secureTokens.hash(refreshToken));
    const session = await this.sessions.findByRefreshTokenHash(presented);
    if (!session) throw new SessionRevokedError();

    const now = this.clock.now();
    const next = this.secureTokens.generate();
    try {
      session.rotate({
        presented,
        next: RefreshTokenHash.fromHash(next.hash),
        expiresAt: this.sessionIssuer.refreshExpiry(now),
        now,
      });
    } catch (error) {
      // The revocation caused by token reuse must survive the failed request.
      if (error instanceof RefreshTokenReuseDetectedError) await this.sessions.save(session);
      throw error;
    }

    const user = await this.users.findById(session.userId);
    if (!user) throw new SessionRevokedError();
    await this.sessions.save(session);
    return this.sessionIssuer.view(user, session, next.token);
  }
}
