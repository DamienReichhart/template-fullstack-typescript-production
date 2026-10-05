import { describe, expect, it } from 'bun:test';

import { createNotificationsTestKit } from '../../testing/notifications-test-kit.js';
import { SendEmailVerificationCommand } from './send-email-verification.command.js';
import { SendEmailVerificationHandler } from './send-email-verification.handler.js';

describe('SendEmailVerificationHandler', () => {
  it('links to the verification page with the token and states the remaining validity', async () => {
    const kit = createNotificationsTestKit();
    const handler = new SendEmailVerificationHandler(
      kit.renderer,
      kit.mailer,
      kit.links,
      kit.clock,
    );
    const expiresAt = new Date(kit.clock.now().getTime() + 24 * 3_600_000);

    await handler.execute(
      new SendEmailVerificationCommand('ada@example.com', 'Ada', 'en', 'secret', expiresAt),
    );

    expect(kit.renderer.rendered[0]).toMatchObject({
      kind: 'verify-email',
      verificationUrl: 'https://app.test/en/verify-email?token=secret',
      expiresInHours: 24,
    });
    expect(kit.mailer.sent[0]?.tag).toBe('verify-email');
  });
});
