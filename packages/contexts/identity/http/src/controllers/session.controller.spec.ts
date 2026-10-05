import 'reflect-metadata';

import { afterEach, describe, expect, it } from 'bun:test';

import { createIdentityTestApp } from '../testing/create-identity-test-app.js';

let context: Awaited<ReturnType<typeof createIdentityTestApp>>;

afterEach(async () => {
  await context.close();
});

async function signedUp() {
  context = await createIdentityTestApp();
  await context.kit.givenUser({ email: 'ada@example.com', password: 'correct horse battery' });
  return context;
}

describe('SessionController', () => {
  it('logs in, reads the current user, and logs out', async () => {
    const { post, agent } = await signedUp();

    const login = await post('/api/v1/auth/login').send({
      email: 'ada@example.com',
      password: 'correct horse battery',
    });
    expect(login.status).toBe(200);
    expect((await agent.get('/api/v1/me')).body.email).toBe('ada@example.com');

    expect((await post('/api/v1/auth/logout')).status).toBe(204);
    expect((await agent.get('/api/v1/me')).status).toBe(401);
  });

  it('answers INVALID_CREDENTIALS for a wrong password', async () => {
    const { post } = await signedUp();

    const response = await post('/api/v1/auth/login').send({
      email: 'ada@example.com',
      password: 'wrong password!',
    });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('rotates the refresh token on refresh', async () => {
    const { post } = await signedUp();
    const login = await post('/api/v1/auth/login').send({
      email: 'ada@example.com',
      password: 'correct horse battery',
    });
    const firstRefresh = /tpl_rt=([^;]+)/.exec(String(login.headers['set-cookie']))?.[1];

    const refresh = await post('/api/v1/auth/refresh');

    expect(refresh.status).toBe(200);
    const secondRefresh = /tpl_rt=([^;]+)/.exec(String(refresh.headers['set-cookie']))?.[1];
    expect(secondRefresh).toBeDefined();
    expect(secondRefresh).not.toBe(firstRefresh);
  });

  it('requires authentication for the current user', async () => {
    const { agent } = await signedUp();
    const response = await agent.get('/api/v1/me');
    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHENTICATED');
  });
});
