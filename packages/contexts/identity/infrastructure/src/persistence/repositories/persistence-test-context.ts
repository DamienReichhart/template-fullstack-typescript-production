import 'reflect-metadata';

import { Test } from '@nestjs/testing';
import { ConfigModule, databaseConfig } from '@template/config';
import { DatabaseModule, PrismaService, PrismaTransactionHost } from '@template/database';
import { resetDatabase } from '@template/database/testing';
import { UnitOfWork } from '@template/ddd';

/** Real Postgres (DATABASE_TEST_URL) for repository integration tests. */
export async function createPersistenceTestContext() {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        definitions: [databaseConfig],
        env: { DATABASE_URL: process.env['DATABASE_TEST_URL'] },
      }),
      DatabaseModule.forRoot(),
    ],
  }).compile();
  await moduleRef.init();

  const prisma = moduleRef.get(PrismaService);
  return {
    prisma,
    host: moduleRef.get(PrismaTransactionHost),
    unitOfWork: moduleRef.get(UnitOfWork),
    reset: () => resetDatabase(prisma),
    close: () => moduleRef.close(),
  };
}
