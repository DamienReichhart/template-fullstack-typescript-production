import { Module } from '@nestjs/common';
import { MessagingModule as PlatformMessagingModule } from '@template/messaging';

/**
 * Synchronises declared schedules with Redis on boot (upsert + prune orphans). Executes
 * nothing: BullMQ enqueues each occurrence, the worker runs it. Safe with N replicas.
 */
@Module({
  imports: [
    PlatformMessagingModule.forRoot({ connectionName: 'scheduler', synchroniseSchedules: true }),
  ],
})
export class MessagingModule {}
