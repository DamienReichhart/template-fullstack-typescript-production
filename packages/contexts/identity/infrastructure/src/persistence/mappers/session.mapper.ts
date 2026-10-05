import type { Session as SessionRecord } from '@template/database';
import { RefreshTokenHash, Session, SessionId, UserId } from '@template/identity-domain';

export const SessionMapper = {
  toDomain(record: SessionRecord): Session {
    return Session.reconstitute(SessionId.from(record.id), {
      userId: UserId.from(record.userId),
      refreshTokenHash: RefreshTokenHash.fromHash(record.refreshTokenHash),
      previousRefreshTokenHash: record.previousRefreshTokenHash
        ? RefreshTokenHash.fromHash(record.previousRefreshTokenHash)
        : null,
      userAgent: record.userAgent,
      ipAddress: record.ipAddress,
      expiresAt: record.expiresAt,
      revokedAt: record.revokedAt,
      lastUsedAt: record.lastUsedAt,
      createdAt: record.createdAt,
    });
  },

  toPersistence(session: Session): SessionRecord {
    return {
      id: session.id.value,
      userId: session.userId.value,
      refreshTokenHash: session.refreshTokenHash.value,
      previousRefreshTokenHash: session.previousRefreshTokenHash?.value ?? null,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
      lastUsedAt: session.lastUsedAt,
      createdAt: session.createdAt,
    };
  },
};
