import type { DependencyStatus } from './dependency-status.ts';

/** A dependency the runnable cannot serve without (database, Redis, …). */
export abstract class DependencyIndicator {
  abstract readonly name: string;
  abstract check(): Promise<DependencyStatus>;
}
