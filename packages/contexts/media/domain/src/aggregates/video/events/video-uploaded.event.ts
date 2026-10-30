import { DomainEvent } from '@template/ddd';

/** A User uploaded a Video: its Source waits to be transcoded. */
export class VideoUploadedEvent extends DomainEvent {
  constructor(
    readonly videoId: string,
    readonly ownerId: string,
    occurredAt: Date,
  ) {
    super(occurredAt);
  }
}
