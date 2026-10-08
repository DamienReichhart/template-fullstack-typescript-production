import { describe, expect, it } from 'bun:test';

import { AuthCookies, CommonErrorCode, problemDetailsSchema } from '@template/contracts/common';
import {
  currentUserResponseSchema,
  IdentityErrorCode,
  IdentityRoutes,
} from '@template/contracts/identity';

import { ApiSession } from '../support/api-session.ts';
import { tokenFromEmail, waitForEmail } from '../support/mail-outbox.ts';
import { redis } from '../support/redis.ts';
import { authPath, mePath, PASSWORD, registerUser, uniqueEmail } from '../support/users.ts';

const routes = IdentityRoutes.auth;

describe('registration', () => {
  it('signs the new user in and sends the welcome and verification emails', async () => {
    const { session, email, user } = await registerUser();

    expect(currentUserResponseSchema.parse(user)).toMatchObject({
      email,
      emailVerified: false,
      avatarUrl: null,
    });
    expect(session.cookie(AuthCookies.accessToken)).toBeDefined();
    expect(session.cookie(AuthCookies.refreshToken)).toBeDefined();
    expect(session.cookie(AuthCookies.sessionHint)).toBeDefined();
    expect((await session.get(mePath)).body).toMatchObject({ email });

    await waitForEmail(redis, { to: email, tag: 'welcome' });
    await waitForEmail(redis, { to: email, tag: 'verify-email' });
  });

  it('writes the emails in the language chosen at registration', async () => {
    const { email } = await registerUser({ locale: 'fr' });
    const verification = await waitForEmail(redis, { to: email, tag: 'verify-email' });
    expect(verification.subject).toBe('Vérifiez votre adresse e-mail');
    expect(verification.text).toContain('/fr/verify-email?token=');
  });

  it('rejects an email that is already registered', async () => {
    const { email } = await registerUser();
    const response = await new ApiSession().post(authPath(routes.register), {
      name: 'Twin',
      email: email.toUpperCase(),
      password: PASSWORD,
    });
    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ code: IdentityErrorCode.emailAlreadyTaken });
  });

  it('reports every invalid field with an i18n key', async () => {
    const response = await new ApiSession().post(authPath(routes.register), {
      name: '',
      email: 'not-an-email',
      password: 'short',
    });
    expect(response.status).toBe(400);
    const problem = problemDetailsSchema.parse(response.body);
    expect(problem.code).toBe(CommonErrorCode.validationFailed);
    // Messages are translation keys; params feed the ICU placeholders on the client.
    expect(problem.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'name', message: 'validation.name.required' }),
        expect.objectContaining({ path: 'email', message: 'validation.email.invalid' }),
        expect.objectContaining({
          path: 'password',
          message: 'validation.password.tooShort',
          params: { minimum: 12 },
        }),
      ]),
    );
    expect(problem.errors).toHaveLength(3);
  });

  it('verifies the email once with the emailed token', async () => {
    const { session, email } = await registerUser();
    const token = await tokenFromEmail(email, 'verify-email', '/verify-email');

    expect((await session.post(authPath(routes.verifyEmail), { token })).status).toBe(204);
    expect((await session.get(mePath)).body).toMatchObject({ emailVerified: true });

    const replay = await session.post(authPath(routes.verifyEmail), { token });
    expect(replay.status).toBe(400);
    expect(replay.body).toMatchObject({ code: IdentityErrorCode.invalidOrExpiredToken });
  });

  it('rate-limits registrations per client', async () => {
    const session = new ApiSession();
    const attempt = () =>
      session.post(authPath(routes.register), {
        name: 'Burst',
        email: uniqueEmail('burst'),
        password: PASSWORD,
      });
    for (let i = 0; i < 5; i++) expect((await attempt()).status).toBe(201);

    const limited = await attempt();
    expect(limited.status).toBe(429);
    expect(limited.body).toMatchObject({ code: CommonErrorCode.rateLimited });
    expect(Number(limited.headers.get('retry-after'))).toBeGreaterThan(0);
  });
});
