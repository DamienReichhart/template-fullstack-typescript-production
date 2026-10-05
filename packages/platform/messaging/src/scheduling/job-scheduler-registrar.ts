import { getQueueToken } from '@nestjs/bullmq';
import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { DiscoveryService, ModuleRef } from '@nestjs/core';
import type { Queue } from 'bullmq';

import { ScheduleBundle, type ScheduleDefinition } from './schedule-definition.js';

/**
 * Makes Redis match the declared schedules on every boot: upserts each declared job
 * scheduler and removes the ones no longer declared. Idempotent, so any number of
 * scheduler replicas can run it concurrently.
 */
@Injectable()
export class JobSchedulerRegistrar implements OnApplicationBootstrap {
  private readonly logger = new Logger(JobSchedulerRegistrar.name);

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly moduleRef: ModuleRef,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.synchronise(this.declaredSchedules());
  }

  async synchronise(schedules: readonly ScheduleDefinition[]): Promise<void> {
    const byQueue = Map.groupBy(schedules, (schedule) => schedule.job.queue.name);

    for (const [queueName, queueSchedules] of byQueue) {
      const queue = this.moduleRef.get<Queue>(getQueueToken(queueName), { strict: false });
      const declared = new Set(queueSchedules.map((schedule) => schedule.id));

      for (const schedule of queueSchedules) {
        await queue.upsertJobScheduler(
          schedule.id,
          { pattern: schedule.pattern, tz: schedule.timezone },
          { name: schedule.job.name, data: schedule.payload, opts: schedule.job.options },
        );
        this.logger.log(
          `Scheduled ${queueName}/${schedule.job.name} (${schedule.pattern}) as "${schedule.id}"`,
        );
      }

      for (const existing of await queue.getJobSchedulers()) {
        if (existing.key && !declared.has(existing.key)) {
          await queue.removeJobScheduler(existing.key);
          this.logger.warn(`Removed orphaned scheduler "${existing.key}" from ${queueName}`);
        }
      }
    }
  }

  private declaredSchedules(): ScheduleDefinition[] {
    return this.discovery
      .getProviders()
      .map((wrapper) => wrapper.instance as unknown)
      .filter((instance): instance is ScheduleBundle => instance instanceof ScheduleBundle)
      .flatMap((bundle) => bundle.schedules);
  }
}
