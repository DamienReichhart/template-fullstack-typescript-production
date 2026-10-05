import { describe, expect, it } from 'bun:test';

import { ApiError } from './api-error.js';

const problemResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/problem+json' },
  });

describe('ApiError', () => {
  it('reads the code, field errors and request id of a problem response', async () => {
    const error = await ApiError.fromResponse(
      problemResponse(
        {
          type: 'about:blank',
          title: 'Bad Request',
          status: 400,
          code: 'VALIDATION_FAILED',
          requestId: 'req-1',
          errors: [{ path: 'email', message: 'validation.email.invalid' }],
        },
        400,
      ),
    );

    expect(error.code).toBe('VALIDATION_FAILED');
    expect(error.requestId).toBe('req-1');
    expect(error.fieldErrors).toEqual([{ path: 'email', message: 'validation.email.invalid' }]);
  });

  it('falls back to INTERNAL_ERROR for non-problem 5xx responses', async () => {
    const error = await ApiError.fromResponse(
      new Response('<html>Bad gateway</html>', { status: 502 }),
    );
    expect(error.code).toBe('INTERNAL_ERROR');
  });

  it('falls back to UNKNOWN for non-problem 4xx responses', async () => {
    expect((await ApiError.fromResponse(new Response('nope', { status: 418 }))).code).toBe(
      'UNKNOWN',
    );
  });
});
