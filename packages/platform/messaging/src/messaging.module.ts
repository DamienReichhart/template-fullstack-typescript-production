import { BullModule } from '@nestjs/bullmq';
import { Module, type DynamicModule, type Provider } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { redisConfig, type ConfigType } from '@template/config';
import type { QueueDefinition } from '@template/queue';
import { createRedisConnection } from '@template/redis';

import { JobProducer } from './producer/job-producer.js';
import { JobSchedulerRegistrar } from './scheduling/job-scheduler-registrar.js';
import { ScheduleBundle, type ScheduleDefinition } from './scheduling/schedule-definition.js';
import {
  WORKER_CONCURRENCY,
  WorkerConcurrencyTuner,
} from './scheduling/worker-concurrency.tuner.js';

export interface MessagingModuleOptions {
  /** Shown in Redis `CLIENT LIST`, e.g. `worker`. */
  connectionName: string;
  /** Set in the worker: concurrency of every processor. */
  workerConcurrency?: number;
  /** Set in the scheduler: synchronise declared schedules with Redis on boot. */
  synchroniseSchedules?: boolean;
}

@Module({})
export class MessagingModule {
  /** Connection, `JobProducer` and the runnable-specific behaviours. Import once per app. */
  static forRoot(options: MessagingModuleOptions): DynamicModule {
    const providers: Provider[] = [JobProducer];
    if (options.workerConcurrency !== undefined) {
      providers.push(
        { provide: WORKER_CONCURRENCY, useValue: options.workerConcurrency },
        WorkerConcurrencyTuner,
      );
    }
    if (options.synchroniseSchedules) providers.push(JobSchedulerRegistrar);

    return {
      module: MessagingModule,
      global: true,
      imports: [
        DiscoveryModule,
        BullModule.forRootAsync({
          inject: [redisConfig.token],
          useFactory: (config: ConfigType<typeof redisConfig>) => ({
            connection: createRedisConnection(config.REDIS_URL, {
              connectionName: `${options.connectionName}:bullmq`,
            }),
          }),
        }),
      ],
      providers,
      exports: [JobProducer],
    };
  }

  /** Makes queues available to `JobProducer` and `@Processor()` classes in the importing module. */
  static registerQueues(...queues: QueueDefinition[]): DynamicModule {
    const registration = BullModule.registerQueue(
      ...queues.map((queue) => ({ name: queue.name, defaultJobOptions: queue.defaultJobOptions })),
    );
    return { module: MessagingModule, imports: [registration], exports: [registration] };
  }

  /** Contributes recurring jobs; the scheduler's registrar picks them up at boot. */
  static registerSchedules(...schedules: ScheduleDefinition[]): DynamicModule {
    const queues = [...new Map(schedules.map((s) => [s.job.queue.name, s.job.queue])).values()];
    const queueRegistration = MessagingModule.registerQueues(...queues);
    return {
      module: MessagingModule,
      imports: [queueRegistration],
      providers: [
        {
          provide: `schedules:${schedules.map((s) => s.id).join(',')}`,
          useValue: new ScheduleBundle(schedules),
        },
      ],
    };
  }
}
