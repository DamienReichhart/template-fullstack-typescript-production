import { Injectable } from '@nestjs/common';
import { addDays, Clock } from '@template/ddd';
import { RefreshTokenHash, Session, SessionRepository, type User } from '@template/identity-domain';

import { IdentitySettings } from '../ports/configuration/identity-settings.port.ts';
import { AccessTokenIssuer } from '../ports/security/access-token-issuer.port.ts';
import { SecureTokenGenerator } from '../ports/security/secure-token-generator.port.ts';
import type { AuthSessionView } from '../views/auth-session.view.ts';
import type { ClientInfo } from '../views/client-info.ts';
import { CurrentUserViews } from './current-user-views.service.ts';

/** Opens sessions and turns a (user, session, refresh token) triple into a signed-in view. */
@Injectable()
export class SessionIssuer {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly accessTokens: AccessTokenIssuer,
    private readonly secureTokens: SecureTokenGenerator,
    private readonly settings: IdentitySettings,
    private readonly clock: Clock,
    private readonly views: CurrentUserViews,
  ) {}

  async open(user: User, client: ClientInfo = {}): Promise<AuthSessionView> {
    const now = this.clock.now();
    const refreshToken = this.secureTokens.generate();
    const session = Session.open({
      userId: user.id,
      refreshTokenHash: RefreshTokenHash.fromHash(refreshToken.hash),
      expiresAt: this.refreshExpiry(now),
      userAgent: client.userAgent ?? null,
      ipAddress: client.ipAddress ?? null,
      now,
    });
    await this.sessions.save(session);
    return this.view(user, session, refreshToken.token);
  }

  async view(user: User, session: Session, refreshToken: string): Promise<AuthSessionView> {
    const access = await this.accessTokens.issue({
      userId: user.id.value,
      role: user.role,
      emailVerified: user.isEmailVerified,
    });
    return {
      user: await this.views.of(user),
      accessToken: access.token,
      accessTokenExpiresAt: access.expiresAt,
      refreshToken,
      refreshTokenExpiresAt: session.expiresAt,
    };
  }

  /** Sessions slide: each rotation pushes the expiry back by the full TTL. */
  refreshExpiry(now: Date): Date {
    return addDays(now, this.settings.refreshTokenTtlDays);
  }
}
