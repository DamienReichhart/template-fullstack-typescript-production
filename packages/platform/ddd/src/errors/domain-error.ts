/**
 * A broken business rule. Presentation layers translate each concrete subclass into a
 * transport error (e.g. an HTTP problem detail); the domain never knows about transports.
 */
export abstract class DomainError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
