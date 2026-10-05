import { DomainEvent } from '@template/ddd';

export class PasswordResetRequestedEvent extends DomainEvent {
  constructor(
    readonly userId: string,
    occurredAt: Date,
  ) {
    super(occurredAt);
  }
}
