import type { EventBus } from '@nestjs/cqrs';
import type { DomainEvent } from '@template/ddd';

/** Stands in for the CQRS EventBus: records what was published, runs no handler. */
export class RecordingEventBus {
  readonly published: DomainEvent[] = [];

  publishAll(events: DomainEvent[]): void {
    this.published.push(...events);
  }

  publish(event: DomainEvent): void {
    this.published.push(event);
  }

  asEventBus(): EventBus {
    return this as unknown as EventBus;
  }
}
