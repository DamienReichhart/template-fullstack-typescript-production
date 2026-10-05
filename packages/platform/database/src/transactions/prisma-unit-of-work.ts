import { Injectable } from '@nestjs/common';
import { UnitOfWork } from '@template/ddd';

import { PrismaTransactionHost } from './transaction-host.js';

@Injectable()
export class PrismaUnitOfWork extends UnitOfWork {
  constructor(private readonly host: PrismaTransactionHost) {
    super();
  }

  run<T>(work: () => Promise<T>): Promise<T> {
    return this.host.withTransaction(work);
  }
}
