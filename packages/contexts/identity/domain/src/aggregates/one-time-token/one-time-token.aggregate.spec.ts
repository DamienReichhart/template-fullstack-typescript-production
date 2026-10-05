import { describe, expect, it } from 'bun:test';

import { UserId } from '../user/value-objects/user-id.value-object.js';
import { InvalidOrExpiredTokenError } from './errors/invalid-or-expired-token.error.js';
import { OneTimeToken } from './one-time-token.aggregate.js';

const now = new Date('2026-01-01T00:00:00.000Z');
const expiresAt = new Date('2026-01-02T00:00:00.000Z');

const issue = () =>
  OneTimeToken.issue({
    userId: UserId.create(),
    purpose: 'EMAIL_VERIFICATION',
    tokenHash: 'h',
    expiresAt,
    now,
  });

describe('OneTimeToken', () => {
  it('can be consumed once before it expires', () => {
    const token = issue();
    token.consume(now);
    expect(token.consumedAt).toEqual(now);
    expect(() => token.consume(now)).toThrow(InvalidOrExpiredTokenError);
  });

  it('cannot be consumed after it expires', () => {
    expect(() => issue().consume(expiresAt)).toThrow(InvalidOrExpiredTokenError);
  });
});
