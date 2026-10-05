import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import type { Queue } from 'bullmq';
import type { Router } from 'express';

export interface BullBoardRouterOptions {
  /** Absolute mount path, e.g. `/admin/queues`. */
  basePath: string;
  queues: readonly Queue[];
  readOnly?: boolean;
}

/**
 * The Bull Board UI as a plain Express router. The caller mounts it behind its own
 * authentication middleware; nothing here is exposed by default.
 */
export function createBullBoardRouter({
  basePath,
  queues,
  readOnly = false,
}: BullBoardRouterOptions): Router {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(basePath);
  createBullBoard({
    queues: queues.map((queue) => new BullMQAdapter(queue, { readOnlyMode: readOnly })),
    serverAdapter,
  });
  return serverAdapter.getRouter() as Router;
}
