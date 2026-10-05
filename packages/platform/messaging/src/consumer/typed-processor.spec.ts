import { describe, expect, it, mock } from 'bun:test';
import { defineJob, defineQueue } from '@template/queue';
import { UnrecoverableError, type Job } from 'bullmq';
import { z } from 'zod';

import { onJob, TypedProcessor } from './typed-processor.ts';

const reports = defineQueue('reports');
const generateReport = defineJob(reports, 'generate-report', z.object({ reportId: z.string() }));

class ReportsProcessor extends TypedProcessor {
  readonly generate = mock(async (payload: { reportId: string }) => `done:${payload.reportId}`);

  protected handlers() {
    return [onJob(generateReport, (payload) => this.generate(payload))];
  }
}

const job = (name: string, data: unknown) =>
  ({ name, data, id: '1', queueName: 'reports', attemptsMade: 0 }) as unknown as Job;

describe('TypedProcessor', () => {
  it('routes a job to the handler of its name with the parsed payload', async () => {
    const processor = new ReportsProcessor();
    await expect(processor.process(job('generate-report', { reportId: 'r1' }))).resolves.toBe(
      'done:r1',
    );
    expect(processor.generate).toHaveBeenCalledWith({ reportId: 'r1' });
  });

  it('fails unrecoverably on an unknown job name', async () => {
    const processor = new ReportsProcessor();
    await expect(processor.process(job('unknown', {}))).rejects.toBeInstanceOf(UnrecoverableError);
  });

  it('fails unrecoverably on an invalid payload without calling the handler', async () => {
    const processor = new ReportsProcessor();
    await expect(processor.process(job('generate-report', { reportId: 1 }))).rejects.toBeInstanceOf(
      UnrecoverableError,
    );
    expect(processor.generate).not.toHaveBeenCalled();
  });
});
