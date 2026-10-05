import { DomainError } from '@template/ddd';

export class InvalidEmailError extends DomainError {
  constructor(value: string) {
    super(`"${value}" is not a valid email address`);
  }
}
