import { describe, expect, it } from 'bun:test';
import { UserRegisteredEvent } from '@template/identity-domain';

import { createIdentityTestKit } from '../../testing/identity-test-kit.js';
import { SendOnboardingEmailsHandler } from './send-onboarding-emails.handler.js';

describe('SendOnboardingEmailsHandler', () => {
  it('sends the welcome email then a verification link', async () => {
    const kit = createIdentityTestKit();
    const handler = new SendOnboardingEmailsHandler(
      kit.users,
      kit.notifier,
      kit.verificationSender,
    );
    const user = await kit.givenUser();

    await handler.handle(
      new UserRegisteredEvent(user.id.value, 'ada@example.com', 'Ada', 'en', kit.clock.now()),
    );

    expect(kit.notifier.sent.map((n) => n.kind)).toEqual(['welcome', 'email-verification']);
    expect(kit.notifier.last('email-verification')?.recipient).toEqual({
      email: 'ada@example.com',
      name: 'Ada',
      locale: 'en',
    });
  });

  it('never throws, so a mail outage cannot break the request that registered the user', async () => {
    const kit = createIdentityTestKit();
    kit.notifier.sendWelcome = async () => {
      throw new Error('redis down');
    };
    const handler = new SendOnboardingEmailsHandler(
      kit.users,
      kit.notifier,
      kit.verificationSender,
    );
    const user = await kit.givenUser();

    await expect(
      handler.handle(
        new UserRegisteredEvent(user.id.value, 'ada@example.com', 'Ada', 'en', kit.clock.now()),
      ),
    ).resolves.toBeUndefined();
  });
});
