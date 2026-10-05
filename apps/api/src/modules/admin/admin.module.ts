import { Module, type OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost, ModuleRef } from '@nestjs/core';
import { createBullBoardRouter, getQueueToken, MessagingModule } from '@template/messaging';
import { identityMaintenanceQueue, mailQueue, type QueueDefinition } from '@template/queue';
import type { Queue } from 'bullmq';
import type { Express } from 'express';

import { IdentityModule } from '../identity/identity.module.js';
import { BullBoardAuthMiddleware } from './middleware/bull-board-auth.middleware.js';

export const BULL_BOARD_PATH = '/admin/queues';
const BOARD_QUEUES: QueueDefinition[] = [mailQueue, identityMaintenanceQueue];

/**
 * Operational UI for the queues at `/admin/queues`, ADMIN only. Mounted on Express during
 * module init: after Nest's routes, before its not-found handler.
 */
@Module({
  imports: [IdentityModule, MessagingModule.registerQueues(...BOARD_QUEUES)],
  providers: [BullBoardAuthMiddleware],
})
export class AdminModule implements OnModuleInit {
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly moduleRef: ModuleRef,
    private readonly auth: BullBoardAuthMiddleware,
  ) {}

  onModuleInit(): void {
    const express = this.adapterHost.httpAdapter?.getInstance<Express>();
    if (!express) return;
    const queues = BOARD_QUEUES.map((queue) =>
      this.moduleRef.get<Queue>(getQueueToken(queue.name), { strict: false }),
    );
    express.use(
      BULL_BOARD_PATH,
      this.auth.use,
      createBullBoardRouter({ basePath: BULL_BOARD_PATH, queues }),
    );
  }
}
