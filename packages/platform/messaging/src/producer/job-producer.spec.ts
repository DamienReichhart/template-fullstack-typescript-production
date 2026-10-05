import 'reflect-metadata';

import { describe, expect, it, mock } from 'bun:test';
import { getQueueToken } from '@nestjs/bullmq';
import { Test } from '@nestjs/testing';
import { defineJob, defineQueue } from '@template/queue';
import { z } from 'zod';

import { JobProducer } from './job-producer.ts';

const reports = defineQueue('reports');
const generateReport = defineJob(reports, 'generate-report', z.object({ reportId: z.uuid() }), {
  priority: 3,
});

async function setup() {
  const add = mock(async () => ({ id: '42' }));
  const moduleRef = await Test.createTestingModule({
    providers: [JobProducer, { provide: getQueueToken('reports'), useValue: { add } }],
  }).compile();
  return { producer: moduleRef.get(JobProducer), add };
}

describe('JobProducer', () => {
  it('adds a validated job with the definition options to its queue', async () => {
    const { producer, add } = await setup();
    const reportId = '0199b0a0-0000-7000-8000-000000000001';

    await expect(producer.enqueue(generateReport, { reportId }, { delay: 10 })).resolves.toBe('42');
    expect(add).toHaveBeenCalledWith('generate-report', { reportId }, { priority: 3, delay: 10 });
  });

  it('rejects an invalid payload before it reaches Redis', async () => {
    const { producer, add } = await setup();

    await expect(producer.enqueue(generateReport, { reportId: 'nope' })).rejects.toThrow();
    expect(add).not.toHaveBeenCalled();
  });
});
