import { describe, expect, it } from 'bun:test';

import { createNotificationsTestKit } from '../../testing/notifications-test-kit.js';
import { SendPasswordResetEmailCommand } from './send-password-reset-email.command.js';
import { SendPasswordResetEmailHandler } from './send-password-reset-email.handler.js';

describe('SendPasswordResetEmailHandler', () => {
  it('links to the reset page with the token and states the remaining validity', async () => {
    const kit = createNotificationsTestKit();
    const handler = new SendPasswordResetEmailHandler(
      kit.renderer,
      kit.mailer,
      kit.links,
      kit.clock,
    );
    const expiresAt = new Date(kit.clock.now().getTime() + 60 * 60_000);

    await handler.execute(
      new SendPasswordResetEmailCommand('ada@example.com', 'Ada', 'fr', 'secret', expiresAt),
    );

    expect(kit.renderer.rendered[0]).toMatchObject({
      kind: 'reset-password',
      locale: 'fr',
      resetUrl: 'https://app.test/fr/reset-password?token=secret',
      expiresInMinutes: 60,
    });
  });

  it('propagates delivery failures so the job is retried', async () => {
    const kit = createNotificationsTestKit();
    kit.mailer.failNext(new Error('provider down'));
    const handler = new SendPasswordResetEmailHandler(
      kit.renderer,
      kit.mailer,
      kit.links,
      kit.clock,
    );

    await expect(
      handler.execute(
        new SendPasswordResetEmailCommand('ada@example.com', 'Ada', 'en', 't', kit.clock.now()),
      ),
    ).rejects.toThrow('provider down');
  });
});
