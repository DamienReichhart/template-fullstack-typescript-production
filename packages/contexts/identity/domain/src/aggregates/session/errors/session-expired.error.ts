import { DomainError } from '@template/ddd';

export class SessionExpiredError extends DomainError {
  constructor() {
    super('The session has expired');
  }
}
