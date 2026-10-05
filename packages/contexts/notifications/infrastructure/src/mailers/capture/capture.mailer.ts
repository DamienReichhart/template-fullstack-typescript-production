import { Mailer, type EmailMessage } from '@template/notifications-application';
import type { Redis } from '@template/redis';

import { pushToOutbox } from './capture-outbox.js';

/** Keeps emails in a Redis outbox for e2e suites. Never use in production. */
export class CaptureMailer extends Mailer {
  constructor(private readonly redis: Redis) {
    super();
  }

  async send(message: EmailMessage): Promise<void> {
    await pushToOutbox(this.redis, { ...message, capturedAt: new Date().toISOString() });
  }
}
