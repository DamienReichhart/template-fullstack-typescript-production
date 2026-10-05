export interface MappedError {
  status: number;
  code: string;
  detail?: string;
}

/**
 * Translates the domain errors of one bounded context into HTTP problems. Each context's
 * http layer provides one subclass; the problem-details filter discovers them all.
 */
export abstract class DomainErrorMapper {
  /** Returns `undefined` for errors this mapper does not own. */
  abstract map(error: unknown): MappedError | undefined;
}
