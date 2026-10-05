import { describe, expect, it } from 'bun:test';

import { createIdentityTestKit } from '../../testing/identity-test-kit.ts';
import { PurgeExpiredSessionsCommand } from './purge-expired-sessions.command.ts';
import { PurgeExpiredSessionsHandler } from './purge-expired-sessions.handler.ts';

const DAY = 24 * 3600 * 1000;

describe('PurgeExpiredSessionsHandler', () => {
  it('deletes what ended before the retention period and keeps the rest', async () => {
    const kit = createIdentityTestKit();
    const handler = new PurgeExpiredSessionsHandler(kit.sessions, kit.tokens, kit.clock);
    const user = await kit.givenUser();
    await kit.sessionIssuer.open(user);
    await kit.verificationSender.send(user);

    kit.clock.advanceBy(10 * DAY);
    await kit.sessionIssuer.open(user);

    expect(await handler.execute(new PurgeExpiredSessionsCommand())).toEqual({
      sessions: 0,
      oneTimeTokens: 1,
    });

    kit.clock.advanceBy(30 * DAY);
    expect(await handler.execute(new PurgeExpiredSessionsCommand())).toEqual({
      sessions: 1,
      oneTimeTokens: 0,
    });
    expect(kit.sessions.sessions.size).toBe(1);
  });
});
