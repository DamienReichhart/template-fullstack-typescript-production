import { describe, expect, it } from 'bun:test';

import { createIdentityTestKit } from '../../testing/identity-test-kit.js';
import { ResendEmailVerificationCommand } from './resend-email-verification.command.js';
import { ResendEmailVerificationHandler } from './resend-email-verification.handler.js';

function setup() {
  const kit = createIdentityTestKit();
  return { kit, handler: new ResendEmailVerificationHandler(kit.users, kit.verificationSender) };
}

describe('ResendEmailVerificationHandler', () => {
  it('sends a new link and voids the previous one', async () => {
    const { kit, handler } = setup();
    const user = await kit.givenUser();
    await kit.verificationSender.send(user);

    await handler.execute(new ResendEmailVerificationCommand('ada@example.com'));

    const [first, second] = kit.tokens.issuedFor(user.id, 'EMAIL_VERIFICATION');
    expect(first?.consumedAt).not.toBeNull();
    expect(second?.consumedAt).toBeNull();
    expect(kit.notifier.sent.filter((n) => n.kind === 'email-verification')).toHaveLength(2);
  });

  it('does nothing, silently, for an unknown or already verified email', async () => {
    const { kit, handler } = setup();
    await kit.givenUser({ email: 'verified@example.com', verified: true });

    await handler.execute(new ResendEmailVerificationCommand('nobody@example.com'));
    await handler.execute(new ResendEmailVerificationCommand('verified@example.com'));

    expect(kit.notifier.sent).toHaveLength(0);
  });
});
