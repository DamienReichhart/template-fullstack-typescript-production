import { DomainError } from '@template/ddd';

/** Deliberately vague: never reveal whether the email or the password was wrong. */
export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid email or password');
  }
}
