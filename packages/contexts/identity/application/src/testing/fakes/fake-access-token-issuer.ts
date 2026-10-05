import { addSeconds, type Clock } from '@template/ddd';

import {
  AccessTokenIssuer,
  InvalidAccessTokenError,
  type AccessTokenClaims,
  type IssuedAccessToken,
} from '../../ports/security/access-token-issuer.port.js';

/** Tokens are readable JSON so tests can assert their claims. */
export class FakeAccessTokenIssuer extends AccessTokenIssuer {
  constructor(private readonly clock: Clock) {
    super();
  }

  async issue(claims: AccessTokenClaims): Promise<IssuedAccessToken> {
    return {
      token: `access:${JSON.stringify(claims)}`,
      expiresAt: addSeconds(this.clock.now(), 900),
    };
  }

  async verify(token: string): Promise<AccessTokenClaims> {
    if (!token.startsWith('access:')) throw new InvalidAccessTokenError('malformed');
    return JSON.parse(token.slice('access:'.length)) as AccessTokenClaims;
  }
}
