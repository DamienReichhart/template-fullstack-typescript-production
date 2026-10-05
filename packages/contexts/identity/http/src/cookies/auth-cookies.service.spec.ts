import { describe, expect, it, mock } from 'bun:test';
import type { AuthSessionView } from '@template/identity-application';
import type { Response } from 'express';

import { AuthCookiesService } from './auth-cookies.service.js';

function fakeResponse() {
  const cookie = mock(() => undefined);
  const clearCookie = mock(() => undefined);
  return { response: { cookie, clearCookie } as unknown as Response, cookie, clearCookie };
}

const session = {
  accessToken: 'access',
  accessTokenExpiresAt: new Date('2026-01-01T00:15:00.000Z'),
  refreshToken: 'refresh',
  refreshTokenExpiresAt: new Date('2026-01-31T00:00:00.000Z'),
} as AuthSessionView;

describe('AuthCookiesService', () => {
  it('sets httpOnly token cookies, scoping the refresh token to the auth endpoints', () => {
    const { response, cookie } = fakeResponse();
    new AuthCookiesService({ COOKIE_DOMAIN: 'example.com', COOKIE_SECURE: true }).setSession(
      response,
      session,
    );

    expect(cookie).toHaveBeenCalledWith(
      'tpl_at',
      'access',
      expect.objectContaining({ httpOnly: true, path: '/', secure: true, domain: 'example.com' }),
    );
    expect(cookie).toHaveBeenCalledWith(
      'tpl_rt',
      'refresh',
      expect.objectContaining({ httpOnly: true, path: '/api/v1/auth' }),
    );
    expect(cookie).toHaveBeenCalledWith(
      'tpl_session',
      '1',
      expect.objectContaining({ httpOnly: false }),
    );
  });

  it('uses host-only cookies on localhost', () => {
    const { response, cookie } = fakeResponse();
    new AuthCookiesService({ COOKIE_DOMAIN: 'localhost', COOKIE_SECURE: false }).setSession(
      response,
      session,
    );
    expect(cookie).toHaveBeenCalledWith(
      'tpl_at',
      'access',
      expect.objectContaining({ domain: undefined, secure: false }),
    );
  });
});
