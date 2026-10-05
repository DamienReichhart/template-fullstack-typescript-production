import { describe, expect, it } from 'bun:test';
import { z } from 'zod';

import { defineJob } from './define-job.js';
import { defineQueue } from './define-queue.js';

describe('defineQueue / defineJob', () => {
  const reports = defineQueue('reports', { defaultJobOptions: { attempts: 2 } });
  const generate = defineJob(reports, 'generate-report', z.object({ reportId: z.uuid() }), {
    priority: 1,
  });

  it('merges queue options over the platform defaults', () => {
    expect(reports.defaultJobOptions.attempts).toBe(2);
    expect(reports.defaultJobOptions.backoff).toEqual({ type: 'exponential', delay: 5_000 });
  });

  it('binds a job to its queue, name, schema and options', () => {
    expect(generate.queue.name).toBe('reports');
    expect(generate.name).toBe('generate-report');
    expect(generate.options.priority).toBe(1);
    expect(generate.schema.safeParse({ reportId: 'nope' }).success).toBe(false);
  });
});
