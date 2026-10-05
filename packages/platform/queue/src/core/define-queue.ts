import type { JobsOptions } from 'bullmq';

import { defaultJobOptions } from './default-job-options.ts';

export interface QueueDefinition<Name extends string = string> {
  readonly name: Name;
  readonly defaultJobOptions: JobsOptions;
}

export function defineQueue<const Name extends string>(
  name: Name,
  options: { defaultJobOptions?: JobsOptions } = {},
): QueueDefinition<Name> {
  return { name, defaultJobOptions: { ...defaultJobOptions, ...options.defaultJobOptions } };
}
