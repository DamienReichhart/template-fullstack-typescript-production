import { AsyncLocalStorage } from 'node:async_hooks';

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../client/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';

export type PrismaTransactionClient = Prisma.TransactionClient;

/**
 * Carries the active Prisma transaction through async calls, so repositories join the
 * surrounding unit of work without passing a client around.
 *
 * - Inside `withTransaction()`, `tx` is the transaction client.
 * - Outside of it, `tx` is the regular client (each query auto-commits).
 * - Nested `withTransaction()` calls join the outer transaction.
 */
@Injectable()
export class PrismaTransactionHost {
  readonly #storage = new AsyncLocalStorage<PrismaTransactionClient>();

  constructor(private readonly prisma: PrismaService) {}

  get tx(): PrismaTransactionClient {
    return this.#storage.getStore() ?? this.prisma;
  }

  get isInTransaction(): boolean {
    return this.#storage.getStore() !== undefined;
  }

  withTransaction<T>(work: () => Promise<T>): Promise<T> {
    if (this.isInTransaction) return work();
    return this.prisma.$transaction((transaction) => this.#storage.run(transaction, work));
  }
}
