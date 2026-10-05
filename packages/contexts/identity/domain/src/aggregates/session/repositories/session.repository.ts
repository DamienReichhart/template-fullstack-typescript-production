import type { UserId } from '../../user/value-objects/user-id.value-object.js';
import type { Session } from '../session.aggregate.js';
import type { RefreshTokenHash } from '../value-objects/refresh-token-hash.value-object.js';

export abstract class SessionRepository {
  /** Matches the current **or the previous** refresh token, so reuse can be detected. */
  abstract findByRefreshTokenHash(hash: RefreshTokenHash): Promise<Session | null>;
  abstract save(session: Session): Promise<void>;
  abstract revokeAllForUser(userId: UserId, now: Date): Promise<void>;
  /** Removes sessions that expired or were revoked before `before`. Returns how many. */
  abstract deleteEndedBefore(before: Date): Promise<number>;
}
