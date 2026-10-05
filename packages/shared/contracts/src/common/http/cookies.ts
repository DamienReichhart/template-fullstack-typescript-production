/**
 * Cookie names shared by the API (which sets them) and the web app (which reads the
 * non-sensitive ones). Access and refresh tokens are httpOnly and never readable by JS.
 */
export const AuthCookies = {
  /** httpOnly, short-lived JWT sent on every API request. */
  accessToken: 'tpl_at',
  /** httpOnly, long-lived opaque token, scoped to the refresh endpoint path. */
  refreshToken: 'tpl_rt',
  /** Readable by JS; echoed in the CSRF header (double-submit pattern). */
  csrfToken: 'tpl_csrf',
  /** Readable hint that a session exists. UX only, never trusted for authorization. */
  sessionHint: 'tpl_session',
} as const;
