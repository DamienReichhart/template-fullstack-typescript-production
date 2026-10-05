import type { DomainEvent } from '../events/domain-event.js';
import { Entity } from './entity.js';
import type { Identifier } from './identifier.js';

/**
 * The consistency boundary of a cluster of objects. State changes go through its methods,
 * which record domain events; the application layer publishes them after persistence.
 */
export abstract class AggregateRoot<Id extends Identifier, Props extends object> extends Entity<
  Id,
  Props
> {
  #domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this.#domainEvents.push(event);
  }

  /** Returns the recorded events and clears them, so each event is published once. */
  pullDomainEvents(): DomainEvent[] {
    const events = this.#domainEvents;
    this.#domainEvents = [];
    return events;
  }
}
