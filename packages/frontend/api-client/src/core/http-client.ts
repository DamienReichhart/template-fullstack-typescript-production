import { apiPath, AuthCookies, CommonErrorCode, HttpHeaders } from '@template/contracts/common';
import { IdentityErrorCode, IdentityRoutes } from '@template/contracts/identity';
import type { z } from 'zod';

import { ApiError } from './api-error.ts';
import { browserCookies, readCookie } from './cookies.ts';
import { CsrfTokenProvider } from './csrf.ts';
import { RefreshCoordinator } from './refresh-coordinator.ts';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** The part of `fetch` the client uses: any implementation (browser, Node, Bun, test double) fits. */
export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface HttpClientOptions {
  /** API origin, e.g. `http://localhost:4000`. */
  baseUrl: string;
  fetch?: FetchLike;
  /** Cookie source; defaults to `document.cookie` (empty on the server). */
  cookies?: () => string;
  /** Called when a 401 could not be recovered by refreshing the session. */
  onSessionExpired?: () => void;
}

export interface RequestOptions<T> {
  method?: HttpMethod;
  body?: unknown;
  /** Validates (and types) the response body. */
  schema?: z.ZodType<T>;
  signal?: AbortSignal;
  /** Set to false for auth endpoints: a 401 there is an answer, not an expired session. */
  refreshOnUnauthorized?: boolean;
}

const SAFE_METHODS = new Set<HttpMethod>(['GET']);
const CONCURRENT_REFRESH_SETTLE_MS = 250;

/**
 * The only way the web app talks to the API. Handles cookies (`credentials: include`),
 * the CSRF header, transparent session refresh on 401 (once, single-flight) and turns every
 * failure into an `ApiError`.
 */
export class HttpClient {
  private readonly fetchImpl: FetchLike;
  private readonly cookies: () => string;
  private readonly csrf: CsrfTokenProvider;
  private readonly refreshes: RefreshCoordinator;

  constructor(private readonly options: HttpClientOptions) {
    this.fetchImpl = options.fetch ?? ((input, init) => fetch(input, init));
    this.cookies = options.cookies ?? browserCookies;
    this.csrf = new CsrfTokenProvider(this.cookies, async () => {
      await this.fetchImpl(
        this.url(apiPath(IdentityRoutes.auth.controller, IdentityRoutes.auth.csrf)),
        {
          credentials: 'include',
        },
      );
    });
    this.refreshes = new RefreshCoordinator(() => this.performRefresh());
  }

  get<T>(path: string, options: Omit<RequestOptions<T>, 'method' | 'body'> = {}): Promise<T> {
    return this.request(path, { ...options, method: 'GET' });
  }

  post<T>(
    path: string,
    body?: unknown,
    options: Omit<RequestOptions<T>, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.request(path, { ...options, method: 'POST', body });
  }

  /** Rotates the session now (e.g. right after an email verification changed its claims). */
  refreshSession(): Promise<boolean> {
    return this.refreshes.refresh();
  }

  async request<T>(
    path: string,
    options: RequestOptions<T> = {},
    retried = { session: false, csrf: false },
  ): Promise<T> {
    const response = await this.send(path, options);
    if (response.ok) return this.parse(response, options.schema);

    const error = await ApiError.fromResponse(response);
    if (error.is(CommonErrorCode.csrfTokenInvalid) && !retried.csrf) {
      await this.csrf.renew();
      return this.request(path, options, { ...retried, csrf: true });
    }
    if (
      error.status === 401 &&
      options.refreshOnUnauthorized !== false &&
      !retried.session &&
      this.hasSessionHint()
    ) {
      if (await this.refreshes.refresh())
        return this.request(path, options, { ...retried, session: true });
      this.options.onSessionExpired?.();
    }
    throw error;
  }

  private async send(
    path: string,
    { method = 'GET', body, signal }: RequestOptions<unknown>,
  ): Promise<Response> {
    const headers = new Headers({ accept: 'application/json' });
    if (body !== undefined) headers.set('content-type', 'application/json');
    if (!SAFE_METHODS.has(method)) {
      const token = await this.csrf.token();
      if (token) headers.set(HttpHeaders.csrfToken, token);
    }
    try {
      return await this.fetchImpl(this.url(path), {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        credentials: 'include',
        signal,
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw ApiError.network();
    }
  }

  private async parse<T>(response: Response, schema?: z.ZodType<T>): Promise<T> {
    if (response.status === 204 || response.headers.get('content-length') === '0')
      return undefined as T;
    const text = await response.text();
    if (!text) return undefined as T;
    const json: unknown = JSON.parse(text);
    return schema ? schema.parse(json) : (json as T);
  }

  /**
   * True when a session may exist: the api sets a readable hint cookie next to its httpOnly
   * ones. Without it a refresh cannot succeed, and asking who is signed in is pointless.
   */
  hasSessionHint(): boolean {
    return readCookie(this.cookies(), AuthCookies.sessionHint) !== undefined;
  }

  private async performRefresh(): Promise<boolean> {
    const response = await this.send(
      apiPath(IdentityRoutes.auth.controller, IdentityRoutes.auth.refresh),
      {
        method: 'POST',
      },
    );
    if (response.ok) return true;
    // Another tab rotated the session a moment ago: its cookies are already ours.
    if (response.status === 409) {
      const error = await ApiError.fromResponse(response);
      if (error.is(IdentityErrorCode.sessionRefreshConflict)) {
        await new Promise((resolve) => setTimeout(resolve, CONCURRENT_REFRESH_SETTLE_MS));
        return true;
      }
    }
    return false;
  }

  private url(path: string): string {
    return `${this.options.baseUrl.replace(/\/+$/, '')}${path}`;
  }
}

export function createHttpClient(options: HttpClientOptions): HttpClient {
  return new HttpClient(options);
}
