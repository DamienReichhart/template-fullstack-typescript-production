import { DomainEvent } from '@template/ddd';

export class UserRegisteredEvent extends DomainEvent {
  constructor(
    readonly userId: string,
    readonly email: string,
    readonly name: string,
    readonly locale: string,
    occurredAt: Date,
  ) {
    super(occurredAt);
  }
}
