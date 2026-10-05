import type { JobsOptions } from 'bullmq';
import type { z } from 'zod';

import type { QueueDefinition } from './define-queue.js';

/**
 * A job contract: the queue it runs on, its name and its payload schema. Producers and
 * processors in different apps import the same definition, so a payload change is a
 * compile error on both sides rather than a poison message in production.
 */
export interface JobDefinition<
  Name extends string = string,
  Schema extends z.ZodType = z.ZodType,
  Queue extends QueueDefinition = QueueDefinition,
> {
  readonly queue: Queue;
  readonly name: Name;
  readonly schema: Schema;
  readonly options: JobsOptions;
}

export type JobPayload<Definition extends JobDefinition> = z.input<Definition['schema']>;
export type ParsedJobPayload<Definition extends JobDefinition> = z.output<Definition['schema']>;

export function defineJob<
  const Name extends string,
  Schema extends z.ZodType,
  Queue extends QueueDefinition,
>(
  queue: Queue,
  name: Name,
  schema: Schema,
  options: JobsOptions = {},
): JobDefinition<Name, Schema, Queue> {
  return { queue, name, schema, options };
}
