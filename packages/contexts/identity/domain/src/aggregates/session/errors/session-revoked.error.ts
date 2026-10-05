import { DomainError } from '@template/ddd';

export class SessionRevokedError extends DomainError {
  constructor() {
    super('The session has been revoked or does not exist');
  }
}
