import { defineQueue } from '../../core/define-queue.ts';

/**
 * Transactional emails. Payloads can carry one-time tokens, so completed jobs are removed
 * immediately instead of being retained.
 */
export const mailQueue = defineQueue('mail', {
  defaultJobOptions: { removeOnComplete: true },
});
