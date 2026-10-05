import { describe, expect, it, mock } from 'bun:test';
import type { JobProducer } from '@template/messaging';
import { sendEmailVerificationJob, sendWelcomeEmailJob } from '@template/queue';

import { BullMqIdentityNotifier } from './bullmq-identity-notifier.js';

const recipient = { email: 'ada@example.com', name: 'Ada', locale: 'fr' };

describe('BullMqIdentityNotifier', () => {
  it('enqueues mail jobs whose payloads satisfy the queue contracts', async () => {
    const enqueue = mock(async () => 'job-id');
    const notifier = new BullMqIdentityNotifier({ enqueue } as unknown as JobProducer);

    await notifier.sendWelcome(recipient);
    await notifier.sendEmailVerification(recipient, 'secret', new Date('2026-01-02T00:00:00.000Z'));

    expect(enqueue).toHaveBeenCalledWith(sendWelcomeEmailJob, recipient);
    expect(enqueue).toHaveBeenCalledWith(sendEmailVerificationJob, {
      ...recipient,
      token: 'secret',
      expiresAt: '2026-01-02T00:00:00.000Z',
    });
    const verificationPayload = (enqueue.mock.calls[1] as unknown[])[1];
    expect(sendEmailVerificationJob.schema.safeParse(verificationPayload).success).toBe(true);
  });
});
