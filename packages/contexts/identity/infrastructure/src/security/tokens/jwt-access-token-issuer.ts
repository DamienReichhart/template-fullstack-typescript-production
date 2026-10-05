import { Inject, Injectable } from '@nestjs/common';
import { addSeconds, Clock } from '@template/ddd';
import {
  AccessTokenIssuer,
  InvalidAccessTokenError,
  type AccessTokenClaims,
  type IssuedAccessToken,
} from '@template/identity-application';
import { isUserRole } from '@template/identity-domain';
import { errors, jwtVerify, SignJWT } from 'jose';

import type { IdentityConfig } from '../../config/identity.config.js';
import { identityConfig } from '../../config/identity-env.schema.js';

const ALGORITHM = 'HS256';
const AUDIENCE = 'template-web';

/** Stateless HS256 access tokens: `sub` = user id, `role`, `ev` = email verified. */
@Injectable()
export class JwtAccessTokenIssuer extends AccessTokenIssuer {
  private readonly secret: Uint8Array;

  constructor(
    @Inject(identityConfig.token) private readonly config: IdentityConfig,
    private readonly clock: Clock,
  ) {
    super();
    this.secret = new TextEncoder().encode(config.JWT_ACCESS_SECRET);
  }

  async issue({ userId, role, emailVerified }: AccessTokenClaims): Promise<IssuedAccessToken> {
    const now = this.clock.now();
    const expiresAt = addSeconds(now, this.config.JWT_ACCESS_TTL_SECONDS);
    const token = await new SignJWT({ role, ev: emailVerified })
      .setProtectedHeader({ alg: ALGORITHM, typ: 'JWT' })
      .setSubject(userId)
      .setIssuer(this.config.JWT_ISSUER)
      .setAudience(AUDIENCE)
      .setIssuedAt(Math.floor(now.getTime() / 1000))
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .sign(this.secret);
    return { token, expiresAt };
  }

  async verify(token: string): Promise<AccessTokenClaims> {
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        algorithms: [ALGORITHM],
        issuer: this.config.JWT_ISSUER,
        audience: AUDIENCE,
        currentDate: this.clock.now(),
      });
      const role = typeof payload['role'] === 'string' ? payload['role'] : '';
      if (!payload.sub || !isUserRole(role) || typeof payload['ev'] !== 'boolean') {
        throw new InvalidAccessTokenError('missing claims');
      }
      return { userId: payload.sub, role, emailVerified: payload['ev'] };
    } catch (error) {
      if (error instanceof InvalidAccessTokenError) throw error;
      if (error instanceof errors.JWTExpired) throw new InvalidAccessTokenError('expired');
      throw new InvalidAccessTokenError('signature or claims rejected');
    }
  }
}
