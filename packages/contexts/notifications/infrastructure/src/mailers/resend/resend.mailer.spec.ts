import { describe, expect, it, mock } from 'bun:test';
import type { Resend } from 'resend';

import { MailDeliveryError, ResendMailer } from './resend.mailer.ts';

const message = {
  to: 'ada@example.com',
  subject: 'Hello',
  html: '<p>Hi</p>',
  text: 'Hi',
  tag: 'welcome',
  idempotencyKey: 'send-welcome-email:42',
};

function clientReturning(result: { error: { name: string; message: string } | null }) {
  const send = mock(async () => ({ data: result.error ? null : { id: 'email-id' }, ...result }));
  return { client: { emails: { send } } as unknown as Pick<Resend, 'emails'>, send };
}

describe('ResendMailer', () => {
  it('sends from the configured sender with an idempotency key and a type tag', async () => {
    const { client, send } = clientReturning({ error: null });

    await new ResendMailer(client, 'Template <hello@example.com>').send(message);

    expect(send).toHaveBeenCalledWith(
      {
        from: 'Template <hello@example.com>',
        to: 'ada@example.com',
        subject: 'Hello',
        html: '<p>Hi</p>',
        text: 'Hi',
        tags: [{ name: 'type', value: 'welcome' }],
      },
      { idempotencyKey: 'send-welcome-email:42' },
    );
  });

  it('throws when Resend reports an error, so the job is retried', async () => {
    const { client } = clientReturning({
      error: { name: 'rate_limit_exceeded', message: 'Too many requests' },
    });
    await expect(
      new ResendMailer(client, 'x <x@example.com>').send(message),
    ).rejects.toBeInstanceOf(MailDeliveryError);
  });
});
