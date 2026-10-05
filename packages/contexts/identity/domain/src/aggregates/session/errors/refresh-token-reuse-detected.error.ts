import { DomainError } from '@template/ddd';

/** An already-rotated refresh token was presented again: it was most likely stolen. */
export class RefreshTokenReuseDetectedError extends DomainError {
  constructor() {
    super('A rotated refresh token was reused; the session has been revoked');
  }
}
