import { getQueueToken } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import type { JobDefinition, JobPayload } from '@template/queue';
import type { JobsOptions, Queue } from 'bullmq';

/**
 * The single way to enqueue work. Validates the payload against the job contract before it
 * reaches Redis, so an invalid job fails in the producer's request, not hours later in a worker.
 */
@Injectable()
export class JobProducer {
  constructor(private readonly moduleRef: ModuleRef) {}

  async enqueue<Definition extends JobDefinition>(
    definition: Definition,
    payload: JobPayload<Definition>,
    options: JobsOptions = {},
  ): Promise<string> {
    const data: unknown = definition.schema.parse(payload);
    const queue = this.moduleRef.get<Queue>(getQueueToken(definition.queue.name), {
      strict: false,
    });
    const job = await queue.add(definition.name, data, { ...definition.options, ...options });
    return job.id ?? '';
  }
}
