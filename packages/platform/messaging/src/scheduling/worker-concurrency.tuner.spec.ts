import 'reflect-metadata';

import { describe, expect, it } from 'bun:test';
import type { DiscoveryService } from '@nestjs/core';

import { TypedProcessor } from '../consumer/typed-processor.ts';
import { WorkerConcurrencyTuner } from './worker-concurrency.tuner.ts';

class MailProcessor extends TypedProcessor {
  protected handlers() {
    return [];
  }
}

class TranscodeProcessor extends TypedProcessor {
  override readonly concurrency = 1;

  protected handlers() {
    return [];
  }
}

/** A processor as BullMQ leaves it after `onModuleInit`: with its worker attached. */
function started<T extends TypedProcessor>(processor: T): T {
  Object.assign(processor, { _worker: { concurrency: 1 } });
  return processor;
}

describe('WorkerConcurrencyTuner', () => {
  it('applies the configured concurrency, except to processors that fix their own', () => {
    const mail = started(new MailProcessor());
    const transcode = started(new TranscodeProcessor());
    const discovery = {
      getProviders: () => [{ instance: mail }, { instance: transcode }, { instance: {} }],
    } as unknown as DiscoveryService;

    new WorkerConcurrencyTuner(discovery, 5).onApplicationBootstrap();

    expect(mail.worker.concurrency).toBe(5);
    expect(transcode.worker.concurrency).toBe(1);
  });
});
