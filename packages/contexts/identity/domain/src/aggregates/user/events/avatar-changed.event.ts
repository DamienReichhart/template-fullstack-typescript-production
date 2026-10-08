import { DomainEvent } from '@template/ddd';

/** A User set, replaced or removed their Avatar. `avatarKey` is null once removed. */
export class AvatarChangedEvent extends DomainEvent {
  constructor(
    readonly userId: string,
    readonly avatarKey: string | null,
    readonly previousAvatarKey: string | null,
    occurredAt: Date,
  ) {
    super(occurredAt);
  }
}
