import { describe, expect, it } from 'bun:test';

import { apiPath, AuthCookies, CommonErrorCode, HttpHeaders } from '@template/contracts/common';
import { IdentityErrorCode, IdentityRoutes } from '@template/contracts/identity';

import { ApiSession } from '../support/api-session.ts';
import type { TestUser } from '../support/users.ts';
import { authPath, mePath, registerUser } from '../support/users.ts';

const routes = IdentityRoutes.auth;
/** The refresh token is only ever sent to the auth endpoints. */
const REFRESH_COOKIE_PATH = apiPath(routes.controller);

function refreshTokenOf({ session }: TestUser): string {
  const token = session.cookie(AuthCookies.refreshToken);
  if (!token) throw new Error('the session holds no refresh token');
  return token;
}

describe('session', () => {
  it('signs in with valid credentials and out again', async () => {
    const { email, password } = await registerUser();
    const session = new ApiSession();

    const login = await session.post(authPath(routes.login), { email, password });
    expect(login.status).toBe(200);
    expect((await session.get(mePath)).status).toBe(200);

    expect((await session.post(authPath(routes.logout))).status).toBe(204);
    expect(session.cookie(AuthCookies.accessToken)).toBeUndefined();
    expect(session.cookie(AuthCookies.sessionHint)).toBeUndefined();
    expect((await session.get(mePath)).status).toBe(401);
  });

  it('answers wrong passwords and unknown emails identically', async () => {
    const { email } = await registerUser();
    const wrongPassword = await new ApiSession().post(authPath(routes.login), {
      email,
      password: 'not-the-password-123',
    });
    const unknownEmail = await new ApiSession().post(authPath(routes.login), {
      email: `nobody-${crypto.randomUUID()}@example.com`,
      password: 'not-the-password-123',
    });
    for (const response of [wrongPassword, unknownEmail]) {
      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({ code: IdentityErrorCode.invalidCredentials });
    }
  });

  it('rejects unsafe requests without the CSRF header', async () => {
    const { session } = await registerUser();
    const response = await session.post(authPath(routes.logout), undefined, {
      headers: { [HttpHeaders.csrfToken]: 'forged' },
    });
    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ code: CommonErrorCode.csrfTokenInvalid });
  });

  it('issues hardened cookies, the refresh token scoped to the auth endpoints', async () => {
    const { session } = await registerUser();
    for (const name of [AuthCookies.accessToken, AuthCookies.refreshToken]) {
      expect(session.cookieAttributes(name)).toContain('httponly');
      expect(session.cookieAttributes(name)).toContain('samesite=lax');
    }
    expect(session.cookieAttributes(AuthCookies.refreshToken)).toContain(
      `path=${REFRESH_COOKIE_PATH}`,
    );
    // Readable by the web app: a UX hint and the CSRF double-submit value.
    expect(session.cookieAttributes(AuthCookies.sessionHint)).not.toContain('httponly');
    expect(session.cookieAttributes(AuthCookies.csrfToken)).not.toContain('httponly');
  });

  it('rotates the refresh token on every refresh', async () => {
    const { session } = await registerUser();
    const before = session.cookie(AuthCookies.refreshToken);

    expect((await session.post(authPath(routes.refresh))).status).toBe(200);
    const after = session.cookie(AuthCookies.refreshToken);
    expect(after).toBeDefined();
    expect(after).not.toBe(before);
    expect((await session.get(mePath)).status).toBe(200);
  });

  it('treats a concurrent refresh with the previous token as a conflict, not a theft', async () => {
    const user = await registerUser();
    const { session } = user;
    const previous = refreshTokenOf(user);
    expect((await session.post(authPath(routes.refresh))).status).toBe(200);

    // A second tab of the same browser, which sent the previous token a moment too late.
    const otherTab = new ApiSession();
    otherTab.setCookie(AuthCookies.refreshToken, previous, REFRESH_COOKIE_PATH);
    const replay = await otherTab.post(authPath(routes.refresh));
    expect(replay.status).toBe(409);
    expect(replay.body).toMatchObject({ code: IdentityErrorCode.sessionRefreshConflict });
    expect((await session.get(mePath)).status).toBe(200);
  });

  it(
    'revokes the whole session when a rotated refresh token is replayed later',
    async () => {
      const user = await registerUser();
      const { session } = user;
      const previous = refreshTokenOf(user);
      expect((await session.post(authPath(routes.refresh))).status).toBe(200);

      await Bun.sleep(10_500); // past the concurrent-refresh grace period
      const attacker = new ApiSession();
      attacker.setCookie(AuthCookies.refreshToken, previous, REFRESH_COOKIE_PATH);
      const replay = await attacker.post(authPath(routes.refresh));
      expect(replay.status).toBe(401);
      expect(replay.body).toMatchObject({ code: IdentityErrorCode.sessionRevoked });

      // The legitimate holder is signed out too: nobody can tell who the thief is.
      expect((await session.post(authPath(routes.refresh))).status).toBe(401);
    },
    { timeout: 30_000 },
  );
});
