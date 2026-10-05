import type { UserId } from '../../user/value-objects/user-id.value-object.ts';
import type { OneTimeToken } from '../one-time-token.aggregate.ts';
import type { OneTimeTokenPurpose } from '../value-objects/one-time-token-purpose.value-object.ts';

export abstract class OneTimeTokenRepository {
  abstract findByHash(
    tokenHash: string,
    purpose: OneTimeTokenPurpose,
  ): Promise<OneTimeToken | null>;
  abstract save(token: OneTimeToken): Promise<void>;
  /** Consumes every outstanding token of a user for a purpose (only the latest link works). */
  abstract consumeAllFor(userId: UserId, purpose: OneTimeTokenPurpose, now: Date): Promise<void>;
  abstract deleteEndedBefore(before: Date): Promise<number>;
}
