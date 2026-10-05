import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import type { DynamicModule } from '@nestjs/common';
import type { QueueDefinition } from '@template/queue';

export interface BullBoardOptions {
  /** Mount path, e.g. `/admin/queues`. */
  route: string;
  queues: readonly QueueDefinition[];
  /** Express middleware guarding the board. The board is never mounted without one. */
  middleware: (request: unknown, response: unknown, next: (error?: unknown) => void) => void;
}

/** Bull Board UI for the given queues, behind the caller's authentication middleware. */
export function createBullBoardModules({
  route,
  queues,
  middleware,
}: BullBoardOptions): DynamicModule[] {
  return [
    BullBoardModule.forRoot({ route, adapter: ExpressAdapter, middleware }),
    ...queues.map((queue) =>
      BullBoardModule.forFeature({ name: queue.name, adapter: BullMQAdapter }),
    ),
  ];
}
