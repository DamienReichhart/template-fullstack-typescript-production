import 'reflect-metadata';

import { afterEach, describe, expect, it } from 'bun:test';

import { createIdentityTestApp } from '../testing/create-identity-test-app.ts';

let context: Awaited<ReturnType<typeof createIdentityTestApp>>;

afterEach(async () => {
  await context.close();
});

const registration = {
  name: 'Ada',
  email: 'ada@example.com',
  password: 'correct horse battery',
  locale: 'fr',
};

describe('RegistrationController', () => {
  it('registers, signs in with httpOnly cookies and sends the onboarding emails', async () => {
    context = await createIdentityTestApp();

    const response = await context.post('/api/v1/auth/register').send(registration);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      email: 'ada@example.com',
      locale: 'fr',
      emailVerified: false,
    });
    expect(response.body).not.toHaveProperty('passwordHash');
    const cookies = String(response.headers['set-cookie']);
    expect(cookies).toContain('tpl_at=');
    expect(cookies).toMatch(/tpl_rt=[^;]+;.*Path=\/api\/v1\/auth;.*HttpOnly/);

    await Bun.sleep(10);
    expect(context.kit.notifier.sent.map((n) => n.kind)).toEqual(['welcome', 'email-verification']);
  });

  it('rejects an invalid payload with translatable field errors', async () => {
    context = await createIdentityTestApp();

    const response = await context
      .post('/api/v1/auth/register')
      .send({ ...registration, password: 'short' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual({
      path: 'password',
      message: 'validation.password.tooShort',
      params: { minimum: 12 },
    });
  });

  it('refuses a duplicate email with EMAIL_ALREADY_TAKEN', async () => {
    context = await createIdentityTestApp();
    await context.post('/api/v1/auth/register').send(registration);

    const response = await context.post('/api/v1/auth/register').send(registration);

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('EMAIL_ALREADY_TAKEN');
  });

  it('refuses state-changing requests without the CSRF header', async () => {
    context = await createIdentityTestApp();

    const response = await context.agent.post('/api/v1/auth/register').send(registration);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('CSRF_TOKEN_INVALID');
  });

  it('verifies the email from the emailed token', async () => {
    context = await createIdentityTestApp();
    await context.post('/api/v1/auth/register').send(registration);
    await Bun.sleep(10);
    const token = context.kit.notifier.last('email-verification')?.token;

    const response = await context.post('/api/v1/auth/verify-email').send({ token });

    expect(response.status).toBe(204);
    expect([...context.kit.users.users.values()][0]?.isEmailVerified).toBe(true);
  });
});
