import { WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { JobDefinition, ParsedJobPayload } from '@template/queue';
import { UnrecoverableError, type Job } from 'bullmq';

export interface JobHandler<Definition extends JobDefinition = JobDefinition> {
  readonly definition: Definition;
  readonly handle: (payload: ParsedJobPayload<Definition>, job: Job) => Promise<unknown>;
}

/** Pairs a job contract with its handler; the payload type is inferred from the contract. */
export function onJob<Definition extends JobDefinition>(
  definition: Definition,
  handle: (payload: ParsedJobPayload<Definition>, job: Job) => Promise<unknown>,
): JobHandler<Definition> {
  return { definition, handle };
}

/**
 * Base class of every queue processor. Routes each job to the handler registered for its
 * name, validates the payload against the job contract and logs the outcome.
 *
 * Invalid payloads and unknown job names are `UnrecoverableError`s: retrying them can only
 * fail again, so they go straight to the failed set for inspection.
 */
export abstract class TypedProcessor extends WorkerHost {
  protected readonly logger = new Logger(this.constructor.name);

  /** Every job of the queue this processor consumes. */
  protected abstract handlers(): readonly JobHandler<JobDefinition>[];

  async process(job: Job): Promise<unknown> {
    const handler = this.handlers().find((candidate) => candidate.definition.name === job.name);
    if (!handler) {
      throw new UnrecoverableError(`No handler for job "${job.name}" on queue "${job.queueName}"`);
    }

    const parsed = handler.definition.schema.safeParse(job.data);
    if (!parsed.success) {
      throw new UnrecoverableError(
        `Invalid payload for job "${job.name}": ${parsed.error.issues.map((i) => i.path.join('.') || i.message).join(', ')}`,
      );
    }

    const startedAt = performance.now();
    const context = {
      queue: job.queueName,
      job: job.name,
      jobId: job.id,
      attempt: job.attemptsMade + 1,
    };
    try {
      const result = await handler.handle(parsed.data, job);
      this.logger.log(
        { ...context, durationMs: Math.round(performance.now() - startedAt) },
        'Job completed',
      );
      return result;
    } catch (error) {
      this.logger.error({ ...context, err: error }, 'Job failed');
      throw error;
    }
  }
}
