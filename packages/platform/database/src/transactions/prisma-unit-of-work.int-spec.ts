import 'reflect-metadata';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { Test } from '@nestjs/testing';
import { ConfigModule, databaseConfig } from '@template/config';
import { UnitOfWork } from '@template/ddd';

import { PrismaService } from '../client/prisma.service.ts';
import { DatabaseModule } from '../database.module.ts';
import { resetDatabase } from '../testing/reset-database.ts';
import { PrismaTransactionHost } from './transaction-host.ts';

const user = (id: string) => ({
  id,
  email: `${id}@example.com`,
  name: 'Test',
  passwordHash: 'hash',
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('PrismaUnitOfWork (integration)', () => {
  let prisma: PrismaService;
  let unitOfWork: UnitOfWork;
  let host: PrismaTransactionHost;
  let close: () => Promise<void>;

  beforeAll(async () => {
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
    prisma = moduleRef.get(PrismaService);
    unitOfWork = moduleRef.get(UnitOfWork);
    host = moduleRef.get(PrismaTransactionHost);
    close = () => moduleRef.close();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await close();
  });

  it('commits every write of a successful unit of work', async () => {
    await unitOfWork.run(async () => {
      await host.tx.user.create({ data: user('0199b0a0-0000-7000-8000-000000000001') });
      await host.tx.user.create({ data: user('0199b0a0-0000-7000-8000-000000000002') });
    });
    expect(await prisma.user.count()).toBe(2);
  });

  it('rolls back every write when the unit of work throws', async () => {
    const failing = unitOfWork.run(async () => {
      await host.tx.user.create({ data: user('0199b0a0-0000-7000-8000-000000000003') });
      throw new Error('boom');
    });
    await expect(failing).rejects.toThrow('boom');
    expect(await prisma.user.count()).toBe(0);
  });

  it('joins the outer transaction when units of work are nested', async () => {
    const failing = unitOfWork.run(async () => {
      await unitOfWork.run(async () => {
        await host.tx.user.create({ data: user('0199b0a0-0000-7000-8000-000000000004') });
      });
      throw new Error('outer failure');
    });
    await expect(failing).rejects.toThrow('outer failure');
    expect(await prisma.user.count()).toBe(0);
  });

  it('uses the plain client outside a unit of work', () => {
    expect(host.isInTransaction).toBe(false);
    expect(host.tx).toBe(prisma);
  });
});
