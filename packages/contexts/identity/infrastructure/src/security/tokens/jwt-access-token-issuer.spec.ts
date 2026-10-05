import { describe, expect, it } from 'bun:test';
import { FixedClock } from '@template/ddd';
import { InvalidAccessTokenError } from '@template/identity-application';

import type { IdentityConfig } from '../../config/identity.config.ts';
import { JwtAccessTokenIssuer } from './jwt-access-token-issuer.ts';

const config = {
  JWT_ACCESS_SECRET: 'a-test-secret-that-is-long-enough-for-hs256',
  JWT_ISSUER: 'template-test',
  JWT_ACCESS_TTL_SECONDS: 900,
} as IdentityConfig;

const claims = {
  userId: '0199b0a0-0000-7000-8000-000000000001',
  role: 'ADMIN',
  emailVerified: true,
} as const;

describe('JwtAccessTokenIssuer', () => {
  it('issues a token that verifies back to the same claims', async () => {
    const clock = new FixedClock();
    const issuer = new JwtAccessTokenIssuer(config, clock);

    const { token, expiresAt } = await issuer.issue(claims);

    expect(expiresAt).toEqual(new Date(clock.now().getTime() + 900_000));
    expect(await issuer.verify(token)).toEqual(claims);
  });

  it('rejects an expired token', async () => {
    const clock = new FixedClock();
    const issuer = new JwtAccessTokenIssuer(config, clock);
    const { token } = await issuer.issue(claims);

    clock.advanceBy(901_000);
    await expect(issuer.verify(token)).rejects.toThrow(InvalidAccessTokenError);
  });

  it('rejects a token signed with another secret', async () => {
    const clock = new FixedClock();
    const forger = new JwtAccessTokenIssuer(
      { ...config, JWT_ACCESS_SECRET: 'x'.repeat(40) },
      clock,
    );
    const { token } = await forger.issue(claims);

    await expect(new JwtAccessTokenIssuer(config, clock).verify(token)).rejects.toThrow(
      InvalidAccessTokenError,
    );
  });

  it('rejects garbage', async () => {
    await expect(
      new JwtAccessTokenIssuer(config, new FixedClock()).verify('a.b.c'),
    ).rejects.toThrow(InvalidAccessTokenError);
  });
});
