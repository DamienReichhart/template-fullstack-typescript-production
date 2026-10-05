import type { UserRole } from '@template/identity-domain';

export interface AccessTokenClaims {
  userId: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface IssuedAccessToken {
  token: string;
  expiresAt: Date;
}

export class InvalidAccessTokenError extends Error {
  constructor(reason: string) {
    super(`Invalid access token: ${reason}`);
    this.name = 'InvalidAccessTokenError';
  }
}

/** Issues and verifies the short-lived, stateless proof that a request belongs to a user. */
export abstract class AccessTokenIssuer {
  abstract issue(claims: AccessTokenClaims): Promise<IssuedAccessToken>;
  /** Throws `InvalidAccessTokenError` when the token is malformed, tampered with or expired. */
  abstract verify(token: string): Promise<AccessTokenClaims>;
}
