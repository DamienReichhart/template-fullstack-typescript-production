import { describe, expect, it } from 'bun:test';

import { HttpHeaders } from '@template/contracts/common';

import { ApiSession } from '../support/api-session.ts';

describe('health probes', () => {
  it('answers liveness without touching dependencies', async () => {
    const response = await new ApiSession().get('/health/live');
    expect(response.status).toBe(200);
  });

  it('answers readiness once the database and redis respond', async () => {
    const response = await new ApiSession().get('/health/ready');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok' });
  });

  it('lives outside the versioned api prefix', async () => {
    expect((await new ApiSession().get('/api/v1/health/live')).status).toBe(404);
  });

  it('echoes the caller request id for log correlation', async () => {
    const requestId = crypto.randomUUID();
    const response = await new ApiSession().get('/health/live', {
      headers: { [HttpHeaders.requestId]: requestId },
    });
    expect(response.headers.get(HttpHeaders.requestId)).toBe(requestId);
  });
});
