import { Module, type DynamicModule } from '@nestjs/common';
import { UnitOfWork } from '@template/ddd';

import { PrismaClientModule } from './client/prisma-client.module.ts';
import { PrismaUnitOfWork } from './transactions/prisma-unit-of-work.ts';

/**
 * Postgres access for the whole app: `PrismaService`, the `PrismaTransactionHost` used by
 * repositories, and the `UnitOfWork` binding used by application handlers.
 */
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      global: true,
      imports: [PrismaClientModule],
      providers: [{ provide: UnitOfWork, useClass: PrismaUnitOfWork }],
      exports: [PrismaClientModule, UnitOfWork],
    };
  }
}
