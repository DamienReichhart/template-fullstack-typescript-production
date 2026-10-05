import { Module } from '@nestjs/common';

import { PrismaTransactionHost } from '../transactions/transaction-host.ts';
import { PrismaService } from './prisma.service.ts';

/** Internal: owns the single PrismaService instance and the transaction host built on it. */
@Module({
  providers: [PrismaService, PrismaTransactionHost],
  exports: [PrismaService, PrismaTransactionHost],
})
export class PrismaClientModule {}
