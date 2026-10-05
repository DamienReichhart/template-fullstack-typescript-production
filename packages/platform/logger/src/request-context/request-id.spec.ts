import { describe, expect, it } from 'bun:test';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { resolveRequestId } from './request-id.js';

function exchange(requestId?: string) {
  const headers: Record<string, string> = {};
  const request = { headers: requestId ? { 'x-request-id': requestId } : {} } as IncomingMessage;
  const response = {
    setHeader: (name: string, value: string) => (headers[name] = value),
  } as unknown as ServerResponse;
  return { request, response, headers };
}

describe('resolveRequestId', () => {
  it('propagates a safe incoming request id and echoes it', () => {
    const { request, response, headers } = exchange('abc-123');
    expect(resolveRequestId(request, response)).toBe('abc-123');
    expect(headers['x-request-id']).toBe('abc-123');
  });

  it('replaces an unsafe incoming request id', () => {
    const { request, response } = exchange('<script>alert(1)</script>');
    expect(resolveRequestId(request, response)).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('generates an id when none is provided', () => {
    const { request, response } = exchange();
    expect(resolveRequestId(request, response)).toMatch(/^[0-9a-f-]{36}$/);
  });
});
