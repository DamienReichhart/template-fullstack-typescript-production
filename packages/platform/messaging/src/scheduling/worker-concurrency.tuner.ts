import { WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

export const WORKER_CONCURRENCY = Symbol.for('template:worker-concurrency');

/** Applies the configured concurrency to every BullMQ worker once they are created. */
@Injectable()
export class WorkerConcurrencyTuner implements OnApplicationBootstrap {
  constructor(
    private readonly discovery: DiscoveryService,
    @Inject(WORKER_CONCURRENCY) private readonly concurrency: number,
  ) {}

  onApplicationBootstrap(): void {
    for (const wrapper of this.discovery.getProviders()) {
      const instance = wrapper.instance as unknown;
      if (instance instanceof WorkerHost) instance.worker.concurrency = this.concurrency;
    }
  }
}
