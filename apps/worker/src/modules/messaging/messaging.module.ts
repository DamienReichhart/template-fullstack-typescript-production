import { Module } from '@nestjs/common';
import { loadConfig } from '@template/config';
import { MessagingModule as PlatformMessagingModule } from '@template/messaging';

import { workerConfig } from '../config/worker.config.ts';

const { worker } = loadConfig([workerConfig]);

/**
 * Consumer side of BullMQ. Workers stop taking jobs on shutdown and wait for the active
 * ones to finish (graceful drain through Nest shutdown hooks).
 */
@Module({
  imports: [
    PlatformMessagingModule.forRoot({
      connectionName: 'worker',
      workerConcurrency: worker.WORKER_CONCURRENCY,
    }),
  ],
})
export class MessagingModule {}
