import { DomainEvent } from '@template/ddd';

export class PasswordChangedEvent extends DomainEvent {
  constructor(
    readonly userId: string,
    occurredAt: Date,
  ) {
    super(occurredAt);
  }
}
