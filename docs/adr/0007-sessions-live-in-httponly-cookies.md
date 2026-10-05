# Sessions live in httpOnly cookies with rotating refresh tokens

The api signs users in with a 15-minute access token and a 30-day refresh token, both in httpOnly, `SameSite=Lax` cookies (the refresh token scoped to `/api/v1/auth`), rotated on every refresh with reuse detection. Script never touches a token, so an XSS cannot exfiltrate a session; in exchange, every unsafe request carries a double-submit CSRF token, and a readable `tpl_session` cookie tells the web app (and its proxy) that a session may exist.

## Considered Options

- Bearer tokens in `localStorage`: simpler, but readable by any injected script.
- A hosted auth provider: less code, but vendor lock-in on the most central table of the system.
