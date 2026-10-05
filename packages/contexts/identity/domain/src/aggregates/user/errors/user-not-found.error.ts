import { DomainError } from '@template/ddd';

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User ${userId} does not exist`);
  }
}
