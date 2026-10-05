import { describe, expect, it } from 'bun:test';

import { UserId } from '../user/value-objects/user-id.value-object.ts';
import { RefreshTokenAlreadyRotatedError } from './errors/refresh-token-already-rotated.error.ts';
import { RefreshTokenReuseDetectedError } from './errors/refresh-token-reuse-detected.error.ts';
import { SessionExpiredError } from './errors/session-expired.error.ts';
import { SessionRevokedError } from './errors/session-revoked.error.ts';
import { Session } from './session.aggregate.ts';
import { RefreshTokenHash } from './value-objects/refresh-token-hash.value-object.ts';

const t0 = new Date('2026-01-01T00:00:00.000Z');
const t1 = new Date('2026-01-01T01:00:00.000Z');
const t1PlusFiveSeconds = new Date('2026-01-01T01:00:05.000Z');
const t2 = new Date('2026-01-01T02:00:00.000Z');
const inThirtyDays = new Date('2026-01-31T00:00:00.000Z');
const hash = (value: string) => RefreshTokenHash.fromHash(value);

const open = () =>
  Session.open({
    userId: UserId.create(),
    refreshTokenHash: hash('a'),
    expiresAt: inThirtyDays,
    now: t0,
  });

describe('Session', () => {
  it('rotates the refresh token and remembers the previous one', () => {
    const session = open();
    session.rotate({ presented: hash('a'), next: hash('b'), expiresAt: inThirtyDays, now: t1 });

    expect(session.refreshTokenHash.value).toBe('b');
    expect(session.previousRefreshTokenHash?.value).toBe('a');
    expect(session.lastUsedAt).toEqual(t1);
  });

  it('revokes itself when a rotated token is replayed after the grace period', () => {
    const session = open();
    session.rotate({ presented: hash('a'), next: hash('b'), expiresAt: inThirtyDays, now: t1 });

    expect(() =>
      session.rotate({ presented: hash('a'), next: hash('c'), expiresAt: inThirtyDays, now: t2 }),
    ).toThrow(RefreshTokenReuseDetectedError);
    expect(session.isActive(t2)).toBe(false);
    expect(() =>
      session.rotate({ presented: hash('b'), next: hash('d'), expiresAt: inThirtyDays, now: t2 }),
    ).toThrow(SessionRevokedError);
  });

  it('tolerates a concurrent refresh within the grace period without revoking', () => {
    const session = open();
    session.rotate({ presented: hash('a'), next: hash('b'), expiresAt: inThirtyDays, now: t1 });

    expect(() =>
      session.rotate({
        presented: hash('a'),
        next: hash('c'),
        expiresAt: inThirtyDays,
        now: t1PlusFiveSeconds,
      }),
    ).toThrow(RefreshTokenAlreadyRotatedError);
    expect(session.isActive(t1PlusFiveSeconds)).toBe(true);
    expect(session.refreshTokenHash.value).toBe('b');
  });

  it('refuses to rotate once expired', () => {
    const session = open();
    expect(() =>
      session.rotate({
        presented: hash('a'),
        next: hash('b'),
        expiresAt: inThirtyDays,
        now: inThirtyDays,
      }),
    ).toThrow(SessionExpiredError);
  });

  it('keeps the first revocation time', () => {
    const session = open();
    session.revoke(t0);
    session.revoke(t1);
    expect(session.revokedAt).toEqual(t0);
  });
});
