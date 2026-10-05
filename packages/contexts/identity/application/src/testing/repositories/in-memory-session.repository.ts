import {
  SessionRepository,
  type RefreshTokenHash,
  type Session,
  type UserId,
} from '@template/identity-domain';

export class InMemorySessionRepository extends SessionRepository {
  readonly sessions = new Map<string, Session>();

  async findByRefreshTokenHash(hash: RefreshTokenHash): Promise<Session | null> {
    return (
      [...this.sessions.values()].find(
        (session) =>
          session.refreshTokenHash.equals(hash) || session.previousRefreshTokenHash?.equals(hash),
      ) ?? null
    );
  }

  async save(session: Session): Promise<void> {
    this.sessions.set(session.id.value, session);
  }

  async revokeAllForUser(userId: UserId, now: Date): Promise<void> {
    for (const session of this.sessions.values()) {
      if (session.userId.equals(userId)) session.revoke(now);
    }
  }

  async deleteEndedBefore(before: Date): Promise<number> {
    let deleted = 0;
    for (const [id, session] of this.sessions) {
      const endedAt = session.revokedAt ?? session.expiresAt;
      if (endedAt < before) {
        this.sessions.delete(id);
        deleted++;
      }
    }
    return deleted;
  }
}
