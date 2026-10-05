import { randomBytes } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { AuthCookies } from '@template/contracts/common';
import type { AuthSessionView } from '@template/identity-application';
import type { Response } from 'express';

import {
  baseCookieOptions,
  identityCookieConfig,
  REFRESH_COOKIE_PATH,
  type IdentityCookieConfig,
} from './cookie-options.js';

/**
 * Owns every auth cookie. Tokens are httpOnly (unreadable by scripts); the CSRF token and
 * the session hint are readable on purpose (double-submit, UX redirects).
 */
@Injectable()
export class AuthCookiesService {
  constructor(@Inject(identityCookieConfig.token) private readonly config: IdentityCookieConfig) {}

  setSession(response: Response, session: AuthSessionView): void {
    const base = baseCookieOptions(this.config);
    response.cookie(AuthCookies.accessToken, session.accessToken, {
      ...base,
      httpOnly: true,
      path: '/',
      expires: session.accessTokenExpiresAt,
    });
    response.cookie(AuthCookies.refreshToken, session.refreshToken, {
      ...base,
      httpOnly: true,
      path: REFRESH_COOKIE_PATH,
      expires: session.refreshTokenExpiresAt,
    });
    response.cookie(AuthCookies.sessionHint, '1', {
      ...base,
      httpOnly: false,
      path: '/',
      expires: session.refreshTokenExpiresAt,
    });
  }

  clearSession(response: Response): void {
    const base = baseCookieOptions(this.config);
    response.clearCookie(AuthCookies.accessToken, { ...base, path: '/' });
    response.clearCookie(AuthCookies.refreshToken, { ...base, path: REFRESH_COOKIE_PATH });
    response.clearCookie(AuthCookies.sessionHint, { ...base, path: '/' });
  }

  issueCsrfToken(response: Response): string {
    const token = randomBytes(32).toString('base64url');
    response.cookie(AuthCookies.csrfToken, token, {
      ...baseCookieOptions(this.config),
      httpOnly: false,
      path: '/',
    });
    return token;
  }
}
