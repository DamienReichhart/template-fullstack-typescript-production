import { describe, expect, it } from 'bun:test';
import { Email, EmailAlreadyTakenError, UserRegisteredEvent } from '@template/identity-domain';

import { createIdentityTestKit } from '../../testing/identity-test-kit.ts';
import { RegisterUserCommand } from './register-user.command.ts';
import { RegisterUserHandler } from './register-user.handler.ts';

function setup() {
  const kit = createIdentityTestKit();
  const handler = new RegisterUserHandler(
    kit.users,
    kit.hasher,
    kit.sessionIssuer,
    kit.unitOfWork,
    kit.clock,
    kit.eventBus.asEventBus(),
  );
  return { kit, handler };
}

describe('RegisterUserHandler', () => {
  it('creates the user with a hashed password and signs them in', async () => {
    const { kit, handler } = setup();

    const result = await handler.execute(
      new RegisterUserCommand('Ada', 'Ada@Example.com', 'correct horse battery', 'fr', {
        userAgent: 'test',
      }),
    );

    const user = await kit.users.findByEmail(Email.create('ada@example.com'));
    expect(user?.passwordHash.value).toBe('hashed:correct horse battery');
    expect(user?.locale).toBe('fr');
    expect(result.user).toMatchObject({
      email: 'ada@example.com',
      emailVerified: false,
      role: 'USER',
    });
    expect(result.refreshToken).toBe('token-1');
    expect(kit.sessions.sessions.size).toBe(1);
  });

  it('publishes UserRegistered after the user is saved', async () => {
    const { kit, handler } = setup();
    await handler.execute(
      new RegisterUserCommand('Ada', 'ada@example.com', 'correct horse battery', 'en'),
    );
    expect(kit.eventBus.published[0]).toBeInstanceOf(UserRegisteredEvent);
  });

  it('refuses an email that is already registered', async () => {
    const { kit, handler } = setup();
    await kit.givenUser({ email: 'ada@example.com' });

    await expect(
      handler.execute(
        new RegisterUserCommand('Ada', 'ADA@example.com', 'correct horse battery', 'en'),
      ),
    ).rejects.toBeInstanceOf(EmailAlreadyTakenError);
    expect(kit.eventBus.published).toHaveLength(0);
  });
});
