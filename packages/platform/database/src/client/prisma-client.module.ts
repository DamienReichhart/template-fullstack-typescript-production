import { Module } from '@nestjs/common';

import { PrismaTransactionHost } from '../transactions/transaction-host.js';
import { PrismaService } from './prisma.service.js';

/** Internal: owns the single PrismaService instance and the transaction host built on it. */
@Module({
  providers: [PrismaService, PrismaTransactionHost],
  exports: [PrismaService, PrismaTransactionHost],
})
export class PrismaClientModule {}
