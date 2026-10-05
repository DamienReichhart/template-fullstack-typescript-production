import { describe, expect, it } from 'bun:test';

import { IdentityErrorCode, IdentityRoutes } from '@template/contracts/identity';

import { ApiSession } from '../support/api-session.ts';
import { tokenFromEmail } from '../support/mail-outbox.ts';
import { readOutboxFor } from '../support/outbox-queries.ts';
import { authPath, mePath, registerUser } from '../support/users.ts';

const routes = IdentityRoutes.auth;
const NEW_PASSWORD = 'a-brand-new-passphrase';

describe('password reset', () => {
  it('replaces the password, revokes every session and burns the token', async () => {
    const { session, email, password } = await registerUser();
    const anonymous = new ApiSession();

    expect((await anonymous.post(authPath(routes.forgotPassword), { email })).status).toBe(202);
    const token = await tokenFromEmail(email, 'reset-password', '/reset-password');

    const reset = await anonymous.post(authPath(routes.resetPassword), {
      token,
      password: NEW_PASSWORD,
    });
    expect(reset.status).toBe(204);

    // Sessions opened with the old password cannot be renewed any more.
    expect((await session.post(authPath(routes.refresh))).status).toBe(401);

    const oldLogin = await new ApiSession().post(authPath(routes.login), { email, password });
    expect(oldLogin.status).toBe(401);

    const fresh = new ApiSession();
    expect(
      (await fresh.post(authPath(routes.login), { email, password: NEW_PASSWORD })).status,
    ).toBe(200);
    expect((await fresh.get(mePath)).status).toBe(200);

    const replay = await anonymous.post(authPath(routes.resetPassword), {
      token,
      password: 'yet-another-passphrase',
    });
    expect(replay.status).toBe(400);
    expect(replay.body).toMatchObject({ code: IdentityErrorCode.invalidOrExpiredToken });
  });

  it('does not reveal whether an email is registered', async () => {
    const unknown = `nobody-${crypto.randomUUID()}@example.com`;
    const response = await new ApiSession().post(authPath(routes.forgotPassword), {
      email: unknown,
    });
    expect(response.status).toBe(202);
    await Bun.sleep(1_000);
    expect(await readOutboxFor(unknown)).toHaveLength(0);
  });
});
