import { describe, expect, it } from 'bun:test';
import { addMinutes } from '@template/ddd';
import {
  InvalidOrExpiredTokenError,
  OneTimeToken,
  PasswordChangedEvent,
} from '@template/identity-domain';

import { createIdentityTestKit } from '../../testing/identity-test-kit.js';
import { ResetPasswordCommand } from './reset-password.command.js';
import { ResetPasswordHandler } from './reset-password.handler.js';

async function setup() {
  const kit = createIdentityTestKit();
  const handler = new ResetPasswordHandler(
    kit.tokens,
    kit.users,
    kit.sessions,
    kit.hasher,
    kit.secureTokens,
    kit.unitOfWork,
    kit.clock,
    kit.eventBus.asEventBus(),
  );
  const user = await kit.givenUser({ password: 'old password value' });
  const secret = kit.secureTokens.generate();
  await kit.tokens.save(
    OneTimeToken.issue({
      userId: user.id,
      purpose: 'PASSWORD_RESET',
      tokenHash: secret.hash,
      expiresAt: addMinutes(kit.clock.now(), 60),
      now: kit.clock.now(),
    }),
  );
  return { kit, handler, user, token: secret.token };
}

describe('ResetPasswordHandler', () => {
  it('sets the new password, revokes every session and consumes the token', async () => {
    const { kit, handler, user, token } = await setup();
    await kit.sessionIssuer.open(user);

    await handler.execute(new ResetPasswordCommand(token, 'brand new passphrase'));

    expect(user.passwordHash.value).toBe('hashed:brand new passphrase');
    expect([...kit.sessions.sessions.values()].every((s) => !s.isActive(kit.clock.now()))).toBe(
      true,
    );
    expect(kit.eventBus.published[0]).toBeInstanceOf(PasswordChangedEvent);
    await expect(
      handler.execute(new ResetPasswordCommand(token, 'another passphrase')),
    ).rejects.toBeInstanceOf(InvalidOrExpiredTokenError);
  });

  it('never accepts an email-verification token', async () => {
    const { kit, handler, user } = await setup();
    await kit.verificationSender.send(user);
    const verificationToken = kit.notifier.last('email-verification')?.token ?? '';

    await expect(
      handler.execute(new ResetPasswordCommand(verificationToken, 'brand new passphrase')),
    ).rejects.toBeInstanceOf(InvalidOrExpiredTokenError);
  });
});
