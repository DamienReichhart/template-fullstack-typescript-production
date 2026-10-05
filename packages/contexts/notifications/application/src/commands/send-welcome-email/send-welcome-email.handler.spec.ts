import { describe, expect, it } from 'bun:test';

import { createNotificationsTestKit } from '../../testing/notifications-test-kit.js';
import { SendWelcomeEmailCommand } from './send-welcome-email.command.js';
import { SendWelcomeEmailHandler } from './send-welcome-email.handler.js';

describe('SendWelcomeEmailHandler', () => {
  it('renders the welcome template in the recipient language and sends it', async () => {
    const kit = createNotificationsTestKit();
    const handler = new SendWelcomeEmailHandler(kit.renderer, kit.mailer, kit.links);

    await handler.execute(new SendWelcomeEmailCommand('ada@example.com', 'Ada', 'fr', 'job-1'));

    expect(kit.renderer.rendered[0]).toEqual({
      kind: 'welcome',
      locale: 'fr',
      name: 'Ada',
      appUrl: 'https://app.test/fr',
    });
    expect(kit.mailer.sent[0]).toMatchObject({
      to: 'ada@example.com',
      idempotencyKey: 'job-1',
      tag: 'welcome',
    });
  });
});
