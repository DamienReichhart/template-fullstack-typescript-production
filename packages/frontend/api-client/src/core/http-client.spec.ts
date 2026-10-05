import { describe, expect, it, mock } from 'bun:test';
import { z } from 'zod';

import { ApiError } from './api-error.js';
import { HttpClient } from './http-client.js';

type Handler = (url: string, init: RequestInit) => Response | Promise<Response>;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const problem = (status: number, code: string) =>
  json({ type: 'about:blank', title: 'Error', status, code }, status);

function setup(handler: Handler, cookies = 'tpl_csrf=csrf-1; tpl_session=1') {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetch = mock(async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return handler(url, init);
  });
  const onSessionExpired = mock(() => undefined);
  const client = new HttpClient({
    baseUrl: 'http://api.test/',
    fetch: fetch as unknown as typeof globalThis.fetch,
    cookies: () => cookies,
    onSessionExpired,
  });
  return { client, calls, onSessionExpired };
}

describe('HttpClient', () => {
  it('sends credentials, JSON and the CSRF header on unsafe requests', async () => {
    const { client, calls } = setup(() => json({ ok: true }));

    await client.post('/api/v1/things', { name: 'x' });

    const [first] = calls;
    if (!first) throw new Error('expected a request');
    const { url, init } = first;
    expect(url).toBe('http://api.test/api/v1/things');
    expect(init.credentials).toBe('include');
    expect(init.body).toBe('{"name":"x"}');
    expect(new Headers(init.headers).get('x-csrf-token')).toBe('csrf-1');
  });

  it('validates responses with the given schema', async () => {
    const { client } = setup(() => json({ id: 1 }));
    await expect(client.get('/x', { schema: z.object({ id: z.string() }) })).rejects.toThrow();
  });

  it('refreshes the session once on 401 and retries the request', async () => {
    let meCalls = 0;
    const { client, calls } = setup((url) => {
      if (url.endsWith('/auth/refresh')) return json({});
      return ++meCalls === 1 ? problem(401, 'UNAUTHENTICATED') : json({ id: 'u1' });
    });

    await expect(client.get('/api/v1/me')).resolves.toEqual({ id: 'u1' });
    expect(calls.map((call) => call.url.replace('http://api.test', ''))).toEqual([
      '/api/v1/me',
      '/api/v1/auth/refresh',
      '/api/v1/me',
    ]);
  });

  it('shares one refresh between concurrent 401s', async () => {
    const seen = new Set<string>();
    const { client, calls } = setup((url) => {
      if (url.endsWith('/auth/refresh')) return json({});
      if (seen.has(url)) return json({ url });
      seen.add(url);
      return problem(401, 'UNAUTHENTICATED');
    });

    await Promise.all([client.get('/a'), client.get('/b'), client.get('/c')]);

    expect(calls.filter((call) => call.url.endsWith('/auth/refresh'))).toHaveLength(1);
  });

  it('reports an expired session when the refresh fails', async () => {
    const { client, onSessionExpired } = setup((url) =>
      url.endsWith('/auth/refresh')
        ? problem(401, 'SESSION_REVOKED')
        : problem(401, 'UNAUTHENTICATED'),
    );

    await expect(client.get('/api/v1/me')).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHENTICATED',
    });
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('does not try to refresh without a session hint', async () => {
    const { client, calls } = setup(() => problem(401, 'UNAUTHENTICATED'), '');
    await expect(client.get('/api/v1/me')).rejects.toBeInstanceOf(ApiError);
    expect(calls).toHaveLength(1);
  });

  it('does not refresh when the endpoint opts out', async () => {
    const { client, calls } = setup(() => problem(401, 'INVALID_CREDENTIALS'));
    await expect(
      client.post('/api/v1/auth/login', {}, { refreshOnUnauthorized: false }),
    ).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
    expect(calls).toHaveLength(1);
  });

  it('treats a concurrent refresh conflict as a successful refresh', async () => {
    let meCalls = 0;
    const { client } = setup((url) => {
      if (url.endsWith('/auth/refresh')) return problem(409, 'SESSION_REFRESH_CONFLICT');
      return ++meCalls === 1 ? problem(401, 'UNAUTHENTICATED') : json({ id: 'u1' });
    });
    await expect(client.get('/api/v1/me')).resolves.toEqual({ id: 'u1' });
  });

  it('renews the CSRF token once when the API rejects it', async () => {
    let posts = 0;
    const { client, calls } = setup((url, init) => {
      if (url.endsWith('/auth/csrf')) return new Response(null, { status: 204 });
      if (init.method === 'POST' && ++posts === 1) return problem(403, 'CSRF_TOKEN_INVALID');
      return new Response(null, { status: 204 });
    });

    await expect(client.post('/api/v1/auth/logout')).resolves.toBeUndefined();
    expect(calls.some((call) => call.url.endsWith('/auth/csrf'))).toBe(true);
  });

  it('turns network failures into NETWORK_ERROR', async () => {
    const { client } = setup(() => {
      throw new TypeError('fetch failed');
    });
    await expect(client.get('/x')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
  });
});
