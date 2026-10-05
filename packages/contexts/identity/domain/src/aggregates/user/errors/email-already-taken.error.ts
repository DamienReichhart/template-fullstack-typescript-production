import { DomainError } from '@template/ddd';

export class EmailAlreadyTakenError extends DomainError {
  constructor() {
    super('An account already exists with this email');
  }
}
