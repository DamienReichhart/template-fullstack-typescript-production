import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { Email, EmailAlreadyTakenError, PasswordHash, User } from '@template/identity-domain';

import { createPersistenceTestContext } from './persistence-test-context.js';
import { PrismaUserRepository } from './prisma-user.repository.js';

const register = (email: string) =>
  User.register({
    email: Email.create(email),
    name: 'Ada',
    passwordHash: PasswordHash.fromHash('hash'),
    locale: 'fr',
    now: new Date('2026-01-01T00:00:00.000Z'),
  });

describe('PrismaUserRepository (integration)', () => {
  let context: Awaited<ReturnType<typeof createPersistenceTestContext>>;
  let users: PrismaUserRepository;

  beforeAll(async () => {
    context = await createPersistenceTestContext();
    users = new PrismaUserRepository(context.host);
  });
  beforeEach(async () => {
    await context.reset();
  });
  afterAll(async () => {
    await context.close();
  });

  it('saves and reloads a user by id and by case-insensitive email', async () => {
    const user = register('ada@example.com');
    await users.save(user);

    const byId = await users.findById(user.id);
    const byEmail = await users.findByEmail(Email.create('ADA@example.com'));
    expect(byId?.email.value).toBe('ada@example.com');
    expect(byEmail?.id.equals(user.id)).toBe(true);
    expect(await users.existsByEmail(Email.create('ada@example.com'))).toBe(true);
  });

  it('updates an existing user on save', async () => {
    const user = register('ada@example.com');
    await users.save(user);

    user.verifyEmail(new Date('2026-01-02T00:00:00.000Z'));
    await users.save(user);

    expect((await users.findById(user.id))?.isEmailVerified).toBe(true);
  });

  it('turns a unique-email violation into EmailAlreadyTakenError', async () => {
    await users.save(register('ada@example.com'));
    await expect(users.save(register('ada@example.com'))).rejects.toBeInstanceOf(
      EmailAlreadyTakenError,
    );
  });
});
