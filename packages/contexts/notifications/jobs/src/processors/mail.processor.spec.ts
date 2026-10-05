import 'reflect-metadata';

import { describe, expect, it, mock } from 'bun:test';
import type { CommandBus } from '@nestjs/cqrs';
import {
  SendEmailVerificationCommand,
  SendWelcomeEmailCommand,
} from '@template/notifications-application';
import type { Job } from 'bullmq';

import { MailProcessor } from './mail.processor.ts';

function setup() {
  const execute = mock(async () => undefined);
  return { execute, processor: new MailProcessor({ execute } as unknown as CommandBus) };
}

const job = (name: string, data: unknown, id = '7') =>
  ({ name, data, id, queueName: 'mail', attemptsMade: 0 }) as unknown as Job;

describe('MailProcessor', () => {
  it('turns a welcome job into a command keyed by the job id', async () => {
    const { execute, processor } = setup();

    await processor.process(
      job('send-welcome-email', { email: 'ada@example.com', name: 'Ada', locale: 'fr' }),
    );

    const command = (execute.mock.calls[0] as unknown[])[0];
    expect(command).toBeInstanceOf(SendWelcomeEmailCommand);
    expect(command).toMatchObject({
      email: 'ada@example.com',
      locale: 'fr',
      idempotencyKey: 'send-welcome-email:7',
    });
  });

  it('parses the token expiry back into a date', async () => {
    const { execute, processor } = setup();

    await processor.process(
      job('send-email-verification', {
        email: 'ada@example.com',
        name: 'Ada',
        locale: 'en',
        token: 'secret',
        expiresAt: '2026-01-02T00:00:00.000Z',
      }),
    );

    const command = (execute.mock.calls[0] as unknown[])[0] as SendEmailVerificationCommand;
    expect(command).toBeInstanceOf(SendEmailVerificationCommand);
    expect(command.expiresAt).toEqual(new Date('2026-01-02T00:00:00.000Z'));
  });
});
