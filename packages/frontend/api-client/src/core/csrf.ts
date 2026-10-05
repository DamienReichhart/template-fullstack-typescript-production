import { AuthCookies } from '@template/contracts/common';

import { readCookie } from './cookies.ts';

/**
 * Provides the double-submit CSRF token: read from its cookie, fetched from the API once
 * (single-flight) when missing.
 */
export class CsrfTokenProvider {
  #inFlight: Promise<void> | null = null;

  constructor(
    private readonly cookies: () => string,
    private readonly fetchToken: () => Promise<void>,
  ) {}

  async token(): Promise<string | undefined> {
    const current = readCookie(this.cookies(), AuthCookies.csrfToken);
    if (current) return current;
    await this.renew();
    return readCookie(this.cookies(), AuthCookies.csrfToken);
  }

  renew(): Promise<void> {
    this.#inFlight ??= this.fetchToken().finally(() => {
      this.#inFlight = null;
    });
    return this.#inFlight;
  }
}
