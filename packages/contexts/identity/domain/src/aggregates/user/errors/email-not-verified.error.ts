import { DomainError } from '@template/ddd';

export class EmailNotVerifiedError extends DomainError {
  constructor() {
    super('The email address of this user is not verified');
  }
}
