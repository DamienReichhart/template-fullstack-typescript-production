import { describe, expect, it } from 'bun:test';
import {
  RefreshTokenAlreadyRotatedError,
  RefreshTokenReuseDetectedError,
  SessionExpiredError,
  SessionRevokedError,
} from '@template/identity-domain';

import { createIdentityTestKit } from '../../testing/identity-test-kit.ts';
import { RefreshSessionCommand } from './refresh-session.command.ts';
import { RefreshSessionHandler } from './refresh-session.handler.ts';

async function setup() {
  const kit = createIdentityTestKit();
  const handler = new RefreshSessionHandler(
    kit.sessions,
    kit.users,
    kit.secureTokens,
    kit.sessionIssuer,
    kit.clock,
  );
  const user = await kit.givenUser();
  const signedIn = await kit.sessionIssuer.open(user);
  return { kit, handler, refreshToken: signedIn.refreshToken };
}

describe('RefreshSessionHandler', () => {
  it('rotates the refresh token and issues a new access token', async () => {
    const { handler, refreshToken } = await setup();

    const refreshed = await handler.execute(new RefreshSessionCommand(refreshToken));

    expect(refreshed.refreshToken).not.toBe(refreshToken);
    expect(refreshed.user.email).toBe('ada@example.com');
  });

  it('revokes the session when a rotated token is replayed later on', async () => {
    const { kit, handler, refreshToken } = await setup();
    const refreshed = await handler.execute(new RefreshSessionCommand(refreshToken));
    kit.clock.advanceBy(60_000);

    await expect(handler.execute(new RefreshSessionCommand(refreshToken))).rejects.toBeInstanceOf(
      RefreshTokenReuseDetectedError,
    );
    await expect(
      handler.execute(new RefreshSessionCommand(refreshed.refreshToken)),
    ).rejects.toBeInstanceOf(SessionRevokedError);
  });

  it('keeps the session alive on a concurrent refresh', async () => {
    const { kit, handler, refreshToken } = await setup();
    const refreshed = await handler.execute(new RefreshSessionCommand(refreshToken));
    kit.clock.advanceBy(2_000);

    await expect(handler.execute(new RefreshSessionCommand(refreshToken))).rejects.toBeInstanceOf(
      RefreshTokenAlreadyRotatedError,
    );
    await expect(
      handler.execute(new RefreshSessionCommand(refreshed.refreshToken)),
    ).resolves.toBeDefined();
  });

  it('refuses unknown and expired refresh tokens', async () => {
    const { kit, handler, refreshToken } = await setup();
    await expect(handler.execute(new RefreshSessionCommand('forged'))).rejects.toBeInstanceOf(
      SessionRevokedError,
    );

    kit.clock.advanceBy(31 * 24 * 3600 * 1000);
    await expect(handler.execute(new RefreshSessionCommand(refreshToken))).rejects.toBeInstanceOf(
      SessionExpiredError,
    );
  });
});
