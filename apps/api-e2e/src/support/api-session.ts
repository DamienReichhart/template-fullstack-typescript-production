import { apiPath, AuthCookies, HttpHeaders } from '@template/contracts/common';
import { IdentityRoutes } from '@template/contracts/identity';

import { e2eEnv } from './env.ts';

export interface ApiResponse<T = unknown> {
  status: number;
  headers: Headers;
  body: T;
}

interface StoredCookie {
  value: string;
  path: string;
  /** Lower-cased attributes as sent by the API, e.g. `httponly`, `samesite=lax`. */
  attributes: string[];
}

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * One API client with its own cookie jar: a browser tab, minus the browser. It honours
 * cookie paths (the refresh token is scoped to /api/v1/auth) and deletions, and performs
 * the CSRF double-submit like the web app does.
 */
export class ApiSession {
  private readonly jar = new Map<string, StoredCookie>();

  constructor(private readonly baseUrl = e2eEnv.apiUrl) {}

  cookie(name: string): string | undefined {
    return this.jar.get(name)?.value;
  }

  cookieAttributes(name: string): string[] {
    return this.jar.get(name)?.attributes ?? [];
  }

  /** Plants a cookie, e.g. a refresh token stolen from another session. */
  setCookie(name: string, value: string, path = '/'): void {
    this.jar.set(name, { value, path, attributes: [`path=${path}`] });
  }

  get<T = unknown>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, init);
  }

  post<T = unknown>(path: string, body?: unknown, init: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body, init);
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown,
    init: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    if (UNSAFE_METHODS.has(method) && !this.jar.has(AuthCookies.csrfToken)) {
      await this.get(apiPath(IdentityRoutes.auth.controller, IdentityRoutes.auth.csrf));
    }
    const headers = new Headers(init.headers);
    const cookies = this.cookieHeader(path);
    if (cookies) headers.set('cookie', cookies);
    const csrf = this.cookie(AuthCookies.csrfToken);
    if (UNSAFE_METHODS.has(method) && csrf && !headers.has(HttpHeaders.csrfToken)) {
      headers.set(HttpHeaders.csrfToken, csrf);
    }
    if (body !== undefined) headers.set('content-type', 'application/json');

    const response = await fetch(new URL(path, this.baseUrl), {
      ...init,
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: 'manual',
    });
    this.store(response.headers.getSetCookie());
    const text = await response.text();
    const isJson = /json/.test(response.headers.get('content-type') ?? '');
    return {
      status: response.status,
      headers: response.headers,
      body: (isJson && text ? JSON.parse(text) : text) as T,
    };
  }

  private cookieHeader(path: string): string {
    return [...this.jar]
      .filter(([, cookie]) => path.startsWith(cookie.path))
      .map(([name, cookie]) => `${name}=${cookie.value}`)
      .join('; ');
  }

  private store(setCookies: string[]): void {
    for (const header of setCookies) {
      const [pair = '', ...raw] = header.split(';').map((part) => part.trim());
      const attributes = raw.map((part) => part.toLowerCase());
      const separator = pair.indexOf('=');
      const name = pair.slice(0, separator);
      const value = pair.slice(separator + 1);
      const attribute = (key: string) =>
        attributes.find((a) => a.startsWith(`${key}=`))?.slice(key.length + 1);
      const expires = attribute('expires');
      const expired =
        attribute('max-age') === '0' ||
        (expires !== undefined && Date.parse(expires) <= Date.now());
      if (!value || expired) this.jar.delete(name);
      else this.jar.set(name, { value, path: attribute('path') ?? '/', attributes });
    }
  }
}
