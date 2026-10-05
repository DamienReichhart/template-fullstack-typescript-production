import { describe, expect, it } from 'bun:test';
import { EmailVerifiedEvent, InvalidOrExpiredTokenError } from '@template/identity-domain';

import { createIdentityTestKit } from '../../testing/identity-test-kit.ts';
import { VerifyEmailCommand } from './verify-email.command.ts';
import { VerifyEmailHandler } from './verify-email.handler.ts';

async function setup() {
  const kit = createIdentityTestKit();
  const handler = new VerifyEmailHandler(
    kit.tokens,
    kit.users,
    kit.secureTokens,
    kit.unitOfWork,
    kit.clock,
    kit.eventBus.asEventBus(),
  );
  const user = await kit.givenUser();
  await kit.verificationSender.send(user);
  const token = kit.notifier.last('email-verification')?.token ?? '';
  return { kit, handler, user, token };
}

describe('VerifyEmailHandler', () => {
  it('verifies the email of the token owner and consumes the token', async () => {
    const { kit, handler, user, token } = await setup();

    await handler.execute(new VerifyEmailCommand(token));

    expect(user.isEmailVerified).toBe(true);
    expect(kit.eventBus.published[0]).toBeInstanceOf(EmailVerifiedEvent);
    await expect(handler.execute(new VerifyEmailCommand(token))).rejects.toBeInstanceOf(
      InvalidOrExpiredTokenError,
    );
  });

  it('rejects an unknown token', async () => {
    const { handler } = await setup();
    await expect(handler.execute(new VerifyEmailCommand('forged'))).rejects.toBeInstanceOf(
      InvalidOrExpiredTokenError,
    );
  });

  it('rejects an expired token', async () => {
    const { kit, handler, token } = await setup();
    kit.clock.advanceBy(25 * 3600 * 1000);
    await expect(handler.execute(new VerifyEmailCommand(token))).rejects.toBeInstanceOf(
      InvalidOrExpiredTokenError,
    );
  });
});
