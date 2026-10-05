import type { JobsOptions } from 'bullmq';

/**
 * Retries with exponential backoff (5s, 10s, 20s, …) and bounded retention, so Redis memory
 * stays flat and failed jobs remain inspectable in Bull Board for a week.
 */
export const defaultJobOptions: JobsOptions = {
  attempts: 5,
  backoff: { type: 'exponential', delay: 5_000 },
  removeOnComplete: { age: 24 * 3600, count: 1_000 },
  removeOnFail: { age: 7 * 24 * 3600 },
};
