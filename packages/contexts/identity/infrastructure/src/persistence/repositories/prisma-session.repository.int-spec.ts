import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { Email, PasswordHash, RefreshTokenHash, Session, User } from '@template/identity-domain';

import { createPersistenceTestContext } from './persistence-test-context.js';
import { PrismaSessionRepository } from './prisma-session.repository.js';
import { PrismaUserRepository } from './prisma-user.repository.js';

const t0 = new Date('2026-01-01T00:00:00.000Z');
const t1 = new Date('2026-01-01T01:00:00.000Z');
const inThirtyDays = new Date('2026-01-31T00:00:00.000Z');
const hash = (value: string) => RefreshTokenHash.fromHash(value);

describe('PrismaSessionRepository (integration)', () => {
  let context: Awaited<ReturnType<typeof createPersistenceTestContext>>;
  let sessions: PrismaSessionRepository;
  let user: User;

  beforeAll(async () => {
    context = await createPersistenceTestContext();
    sessions = new PrismaSessionRepository(context.host);
  });
  beforeEach(async () => {
    await context.reset();
    user = User.register({
      email: Email.create('ada@example.com'),
      name: 'Ada',
      passwordHash: PasswordHash.fromHash('hash'),
      locale: 'en',
      now: t0,
    });
    await new PrismaUserRepository(context.host).save(user);
  });
  afterAll(async () => {
    await context.close();
  });

  it('finds a session by its current and by its previous refresh token', async () => {
    const session = Session.open({
      userId: user.id,
      refreshTokenHash: hash('a'),
      expiresAt: inThirtyDays,
      now: t0,
    });
    session.rotate({ presented: hash('a'), next: hash('b'), expiresAt: inThirtyDays, now: t1 });
    await sessions.save(session);

    expect((await sessions.findByRefreshTokenHash(hash('b')))?.id.equals(session.id)).toBe(true);
    expect((await sessions.findByRefreshTokenHash(hash('a')))?.id.equals(session.id)).toBe(true);
    expect(await sessions.findByRefreshTokenHash(hash('z'))).toBeNull();
  });

  it('revokes every session of a user and deletes ended ones', async () => {
    await sessions.save(
      Session.open({
        userId: user.id,
        refreshTokenHash: hash('a'),
        expiresAt: inThirtyDays,
        now: t0,
      }),
    );
    await sessions.save(
      Session.open({
        userId: user.id,
        refreshTokenHash: hash('b'),
        expiresAt: inThirtyDays,
        now: t0,
      }),
    );

    await sessions.revokeAllForUser(user.id, t1);
    expect((await sessions.findByRefreshTokenHash(hash('a')))?.isActive(t1)).toBe(false);

    expect(await sessions.deleteEndedBefore(new Date('2026-01-02T00:00:00.000Z'))).toBe(2);
  });

  it('joins the surrounding unit of work', async () => {
    const failing = context.unitOfWork.run(async () => {
      await sessions.save(
        Session.open({
          userId: user.id,
          refreshTokenHash: hash('a'),
          expiresAt: inThirtyDays,
          now: t0,
        }),
      );
      throw new Error('rollback');
    });
    await expect(failing).rejects.toThrow('rollback');
    expect(await sessions.findByRefreshTokenHash(hash('a'))).toBeNull();
  });
});
