import { DomainError } from '@template/ddd';

/**
 * The previous refresh token was presented moments after a rotation: two tabs refreshed
 * at once. Not theft, so the session survives; the caller retries with the newer token.
 */
export class RefreshTokenAlreadyRotatedError extends DomainError {
  constructor() {
    super('The refresh token was rotated by a concurrent request');
  }
}
