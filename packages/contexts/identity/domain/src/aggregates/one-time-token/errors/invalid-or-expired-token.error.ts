import { DomainError } from '@template/ddd';

/** One error for unknown, consumed and expired tokens: the caller learns nothing more. */
export class InvalidOrExpiredTokenError extends DomainError {
  constructor() {
    super('The token is invalid, already used or expired');
  }
}
