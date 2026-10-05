import 'reflect-metadata';

import { describe, expect, it, mock } from 'bun:test';
import type { CommandBus } from '@nestjs/cqrs';
import { PurgeExpiredSessionsCommand } from '@template/identity-application';
import type { Job } from 'bullmq';

import { IdentityMaintenanceProcessor } from './identity-maintenance.processor.ts';

describe('IdentityMaintenanceProcessor', () => {
  it('runs the purge command for purge-expired-sessions jobs', async () => {
    const execute = mock(async () => ({ sessions: 2, oneTimeTokens: 1 }));
    const processor = new IdentityMaintenanceProcessor({ execute } as unknown as CommandBus);
    const job = {
      name: 'purge-expired-sessions',
      data: {},
      id: '1',
      queueName: 'identity-maintenance',
      attemptsMade: 0,
    };

    await expect(processor.process(job as unknown as Job)).resolves.toEqual({
      sessions: 2,
      oneTimeTokens: 1,
    });
    expect((execute.mock.calls[0] as unknown[])[0]).toBeInstanceOf(PurgeExpiredSessionsCommand);
  });
});
