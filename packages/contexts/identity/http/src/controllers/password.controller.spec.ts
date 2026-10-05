import 'reflect-metadata';

import { afterEach, describe, expect, it } from 'bun:test';

import { createIdentityTestApp } from '../testing/create-identity-test-app.ts';

let context: Awaited<ReturnType<typeof createIdentityTestApp>>;

afterEach(async () => {
  await context.close();
});

describe('PasswordController', () => {
  it('answers 202 for unknown emails too, without sending anything', async () => {
    context = await createIdentityTestApp();

    const response = await context
      .post('/api/v1/auth/password/forgot')
      .send({ email: 'nobody@example.com' });

    expect(response.status).toBe(202);
    await Bun.sleep(10);
    expect(context.kit.notifier.sent).toHaveLength(0);
  });

  it('resets the password from the emailed token, then the new password signs in', async () => {
    context = await createIdentityTestApp();
    await context.kit.givenUser({ email: 'ada@example.com', password: 'old password value' });

    await context.post('/api/v1/auth/password/forgot').send({ email: 'ada@example.com' });
    await Bun.sleep(10);
    const token = context.kit.notifier.last('password-reset')?.token;

    const reset = await context
      .post('/api/v1/auth/password/reset')
      .send({ token, password: 'brand new passphrase' });
    expect(reset.status).toBe(204);

    const login = await context
      .post('/api/v1/auth/login')
      .send({ email: 'ada@example.com', password: 'brand new passphrase' });
    expect(login.status).toBe(200);
  });

  it('rejects a reused reset token', async () => {
    context = await createIdentityTestApp();
    const response = await context
      .post('/api/v1/auth/password/reset')
      .send({ token: 'forged', password: 'brand new passphrase' });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('INVALID_OR_EXPIRED_TOKEN');
  });
});
