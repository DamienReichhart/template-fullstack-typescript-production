/** Something that happened in the domain, named in the past tense (`UserRegistered`). */
export abstract class DomainEvent {
  protected constructor(readonly occurredAt: Date) {}
}
