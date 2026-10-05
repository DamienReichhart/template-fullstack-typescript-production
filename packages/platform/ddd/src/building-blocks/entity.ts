import type { Identifier } from './identifier.js';

/** An object defined by its identity: two entities with the same id are the same entity. */
export abstract class Entity<Id extends Identifier, Props extends object> {
  protected constructor(
    readonly id: Id,
    protected props: Props,
  ) {}

  equals(other?: Entity<Id, Props> | null): boolean {
    return !!other && other.constructor === this.constructor && this.id.equals(other.id);
  }
}
