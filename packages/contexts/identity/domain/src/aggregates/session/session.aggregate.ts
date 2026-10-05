import { AggregateRoot } from '@template/ddd';

import type { UserId } from '../user/value-objects/user-id.value-object.js';
import { RefreshTokenReuseDetectedError } from './errors/refresh-token-reuse-detected.error.js';
import { SessionExpiredError } from './errors/session-expired.error.js';
import { SessionRevokedError } from './errors/session-revoked.error.js';
import type { RefreshTokenHash } from './value-objects/refresh-token-hash.value-object.js';
import { SessionId } from './value-objects/session-id.value-object.js';

export interface SessionProps {
  userId: UserId;
  refreshTokenHash: RefreshTokenHash;
  previousRefreshTokenHash: RefreshTokenHash | null;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  lastUsedAt: Date;
  createdAt: Date;
}

export interface OpenSessionInput {
  userId: UserId;
  refreshTokenHash: RefreshTokenHash;
  expiresAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
  now: Date;
}

export interface RotateInput {
  presented: RefreshTokenHash;
  next: RefreshTokenHash;
  expiresAt: Date;
  now: Date;
}

/**
 * A signed-in device. Each refresh rotates the token; the previous token is remembered so
 * that replaying it (a stolen token racing the legitimate client) revokes the session.
 */
export class Session extends AggregateRoot<SessionId, SessionProps> {
  static open({
    userId,
    refreshTokenHash,
    expiresAt,
    userAgent,
    ipAddress,
    now,
  }: OpenSessionInput): Session {
    return new Session(SessionId.create(), {
      userId,
      refreshTokenHash,
      previousRefreshTokenHash: null,
      userAgent: userAgent ?? null,
      ipAddress: ipAddress ?? null,
      expiresAt,
      revokedAt: null,
      lastUsedAt: now,
      createdAt: now,
    });
  }

  static reconstitute(id: SessionId, props: SessionProps): Session {
    return new Session(id, props);
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get refreshTokenHash(): RefreshTokenHash {
    return this.props.refreshTokenHash;
  }

  get previousRefreshTokenHash(): RefreshTokenHash | null {
    return this.props.previousRefreshTokenHash;
  }

  get userAgent(): string | null {
    return this.props.userAgent;
  }

  get ipAddress(): string | null {
    return this.props.ipAddress;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get revokedAt(): Date | null {
    return this.props.revokedAt;
  }

  get lastUsedAt(): Date {
    return this.props.lastUsedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  isActive(now: Date): boolean {
    return this.props.revokedAt === null && this.props.expiresAt > now;
  }

  /**
   * Swaps the refresh token for `next`. Throws (and revokes on reuse) when the session can
   * no longer be refreshed; callers must persist the session even when this throws.
   */
  rotate({ presented, next, expiresAt, now }: RotateInput): void {
    if (this.props.revokedAt) throw new SessionRevokedError();
    if (this.props.previousRefreshTokenHash?.equals(presented)) {
      this.revoke(now);
      throw new RefreshTokenReuseDetectedError();
    }
    if (!this.props.refreshTokenHash.equals(presented)) throw new SessionRevokedError();
    if (this.props.expiresAt <= now) throw new SessionExpiredError();

    this.props.previousRefreshTokenHash = this.props.refreshTokenHash;
    this.props.refreshTokenHash = next;
    this.props.expiresAt = expiresAt;
    this.props.lastUsedAt = now;
  }

  revoke(now: Date): void {
    this.props.revokedAt ??= now;
  }
}
