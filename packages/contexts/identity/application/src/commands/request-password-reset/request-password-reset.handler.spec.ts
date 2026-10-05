import { describe, expect, it } from 'bun:test';
import { PasswordResetRequestedEvent } from '@template/identity-domain';

import { createIdentityTestKit } from '../../testing/identity-test-kit.js';
import { RequestPasswordResetCommand } from './request-password-reset.command.js';
import { RequestPasswordResetHandler } from './request-password-reset.handler.js';

function setup() {
  const kit = createIdentityTestKit();
  return {
    kit,
    handler: new RequestPasswordResetHandler(kit.users, kit.clock, kit.eventBus.asEventBus()),
  };
}

describe('RequestPasswordResetHandler', () => {
  it('records PasswordResetRequested for a known email', async () => {
    const { kit, handler } = setup();
    const user = await kit.givenUser();

    await handler.execute(new RequestPasswordResetCommand('ada@example.com'));

    expect(kit.eventBus.published[0]).toBeInstanceOf(PasswordResetRequestedEvent);
    expect(kit.eventBus.published[0]).toMatchObject({ userId: user.id.value });
  });

  it('does nothing, silently, for an unknown email', async () => {
    const { kit, handler } = setup();
    await handler.execute(new RequestPasswordResetCommand('nobody@example.com'));
    expect(kit.eventBus.published).toHaveLength(0);
  });
});
