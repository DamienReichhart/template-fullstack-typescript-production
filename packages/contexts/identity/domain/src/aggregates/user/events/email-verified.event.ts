import { DomainEvent } from '@template/ddd';

export class EmailVerifiedEvent extends DomainEvent {
  constructor(
    readonly userId: string,
    occurredAt: Date,
  ) {
    super(occurredAt);
  }
}
