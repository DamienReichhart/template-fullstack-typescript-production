import 'reflect-metadata';

import { describe, expect, it, mock } from 'bun:test';
import { getQueueToken } from '@nestjs/bullmq';
import { DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { defineJob, defineQueue } from '@template/queue';
import { z } from 'zod';

import { JobSchedulerRegistrar } from './job-scheduler-registrar.js';
import { defineSchedule, ScheduleBundle } from './schedule-definition.js';

const cleanup = defineQueue('cleanup');
const purge = defineJob(cleanup, 'purge', z.object({}), { attempts: 1 });
const nightlyPurge = defineSchedule({
  id: 'nightly-purge',
  job: purge,
  pattern: '0 3 * * *',
  payload: {},
});

async function setup(existingKeys: string[]) {
  const queue = {
    upsertJobScheduler: mock(async () => undefined),
    removeJobScheduler: mock(async () => true),
    getJobSchedulers: mock(async () => existingKeys.map((key) => ({ key }))),
  };
  const moduleRef = await Test.createTestingModule({
    imports: [DiscoveryModule],
    providers: [
      JobSchedulerRegistrar,
      { provide: 'schedules', useValue: new ScheduleBundle([nightlyPurge]) },
      { provide: getQueueToken('cleanup'), useValue: queue },
    ],
  }).compile();
  await moduleRef.init();
  return queue;
}

describe('JobSchedulerRegistrar', () => {
  it('upserts every discovered schedule on boot', async () => {
    const queue = await setup(['nightly-purge']);
    expect(queue.upsertJobScheduler).toHaveBeenCalledWith(
      'nightly-purge',
      { pattern: '0 3 * * *', tz: undefined },
      { name: 'purge', data: {}, opts: { attempts: 1 } },
    );
    expect(queue.removeJobScheduler).not.toHaveBeenCalled();
  });

  it('removes schedulers that are no longer declared', async () => {
    const queue = await setup(['nightly-purge', 'legacy-purge']);
    expect(queue.removeJobScheduler).toHaveBeenCalledWith('legacy-purge');
  });
});
