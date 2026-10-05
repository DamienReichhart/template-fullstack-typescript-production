/**
 * Runs a block of work atomically. Application handlers depend on this port; the database
 * package binds it to a real transaction, tests bind it to a pass-through.
 */
export abstract class UnitOfWork {
  abstract run<T>(work: () => Promise<T>): Promise<T>;
}

/** Executes work without a transaction. For unit tests and in-memory adapters. */
export class ImmediateUnitOfWork extends UnitOfWork {
  run<T>(work: () => Promise<T>): Promise<T> {
    return work();
  }
}
