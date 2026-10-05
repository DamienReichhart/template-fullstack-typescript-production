import { describe, expect, it } from 'bun:test';

import { createIdentityTestKit } from '../../testing/identity-test-kit.ts';
import { LogoutCommand } from './logout.command.ts';
import { LogoutHandler } from './logout.handler.ts';

describe('LogoutHandler', () => {
  it('revokes the session of the refresh token', async () => {
    const kit = createIdentityTestKit();
    const handler = new LogoutHandler(kit.sessions, kit.secureTokens, kit.clock);
    const { refreshToken } = await kit.sessionIssuer.open(await kit.givenUser());

    await handler.execute(new LogoutCommand(refreshToken));

    const [session] = kit.sessions.sessions.values();
    expect(session?.isActive(kit.clock.now())).toBe(false);
  });

  it('ignores missing and unknown tokens', async () => {
    const kit = createIdentityTestKit();
    const handler = new LogoutHandler(kit.sessions, kit.secureTokens, kit.clock);
    await expect(handler.execute(new LogoutCommand(undefined))).resolves.toBeUndefined();
    await expect(handler.execute(new LogoutCommand('unknown'))).resolves.toBeUndefined();
  });
});
