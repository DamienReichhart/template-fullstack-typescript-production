import { describe, expect, it } from 'bun:test';
import { InvalidCredentialsError } from '@template/identity-domain';

import { createIdentityTestKit } from '../../testing/identity-test-kit.js';
import { LoginCommand } from './login.command.js';
import { LoginHandler } from './login.handler.js';

function setup() {
  const kit = createIdentityTestKit();
  return { kit, handler: new LoginHandler(kit.users, kit.hasher, kit.sessionIssuer) };
}

describe('LoginHandler', () => {
  it('opens a session for valid credentials', async () => {
    const { kit, handler } = setup();
    await kit.givenUser({ password: 'correct horse battery' });

    const result = await handler.execute(
      new LoginCommand('ADA@example.com', 'correct horse battery', { ipAddress: '10.0.0.1' }),
    );

    expect(result.user.email).toBe('ada@example.com');
    const [session] = kit.sessions.sessions.values();
    expect(session?.ipAddress).toBe('10.0.0.1');
  });

  it('rejects a wrong password with the same error as an unknown email', async () => {
    const { kit, handler } = setup();
    await kit.givenUser({ password: 'correct horse battery' });

    await expect(
      handler.execute(new LoginCommand('ada@example.com', 'wrong')),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    await expect(
      handler.execute(new LoginCommand('nobody@example.com', 'wrong')),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(kit.sessions.sessions.size).toBe(0);
  });

  it('still hashes the password when the email is unknown (timing safety)', async () => {
    const { kit, handler } = setup();
    await handler.execute(new LoginCommand('nobody@example.com', 'guess')).catch(() => undefined);
    expect(kit.hasher.hashed).toContain('guess');
  });
});
