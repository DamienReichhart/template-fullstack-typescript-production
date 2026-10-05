import { describe, expect, it } from 'bun:test';
import { PasswordResetRequestedEvent } from '@template/identity-domain';

import { createIdentityTestKit } from '../../testing/identity-test-kit.ts';
import { SendPasswordResetEmailHandler } from './send-password-reset-email.handler.ts';

function setup() {
  const kit = createIdentityTestKit();
  const handler = new SendPasswordResetEmailHandler(
    kit.users,
    kit.tokens,
    kit.secureTokens,
    kit.notifier,
    kit.settings,
    kit.unitOfWork,
    kit.clock,
  );
  return { kit, handler };
}

describe('SendPasswordResetEmailHandler', () => {
  it('emails a reset link valid for the configured duration and voids older links', async () => {
    const { kit, handler } = setup();
    const user = await kit.givenUser();
    const event = new PasswordResetRequestedEvent(user.id.value, kit.clock.now());

    await handler.handle(event);
    await handler.handle(event);

    const sent = kit.notifier.last('password-reset');
    expect(sent?.expiresAt).toEqual(new Date(kit.clock.now().getTime() + 60 * 60 * 1000));
    const [first, second] = kit.tokens.issuedFor(user.id, 'PASSWORD_RESET');
    expect(first?.consumedAt).not.toBeNull();
    expect(second?.consumedAt).toBeNull();
  });
});
