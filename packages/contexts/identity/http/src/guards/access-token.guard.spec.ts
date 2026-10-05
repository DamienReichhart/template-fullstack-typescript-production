import 'reflect-metadata';

import { describe, expect, it } from 'bun:test';
import type { Reflector } from '@nestjs/core';
import { FixedClock } from '@template/ddd';
import { FakeAccessTokenIssuer } from '@template/identity-application/testing';
import type { ExecutionContext } from '@nestjs/common';

import { AccessTokenGuard } from './access-token.guard.js';

function contextWith(cookies: Record<string, string>, isPublic = false) {
  const request: Record<string, unknown> = { cookies };
  const reflector = { getAllAndOverride: () => isPublic } as unknown as Reflector;
  const context = {
    getType: () => 'http',
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { request, reflector, context };
}

describe('AccessTokenGuard', () => {
  const issuer = new FakeAccessTokenIssuer(new FixedClock());

  it('attaches the authenticated user from a valid access-token cookie', async () => {
    const { token } = await issuer.issue({ userId: 'u1', role: 'ADMIN', emailVerified: true });
    const { request, reflector, context } = contextWith({ tpl_at: token });

    expect(await new AccessTokenGuard(reflector, issuer).canActivate(context)).toBe(true);
    expect(request['user']).toEqual({ id: 'u1', role: 'ADMIN', emailVerified: true });
  });

  it('lets public routes through without a token', async () => {
    const { reflector, context } = contextWith({}, true);
    expect(await new AccessTokenGuard(reflector, issuer).canActivate(context)).toBe(true);
  });

  it('rejects missing and invalid tokens with UNAUTHENTICATED', async () => {
    for (const cookies of [{}, { tpl_at: 'garbage' }] as Record<string, string>[]) {
      const { reflector, context } = contextWith(cookies);
      await expect(
        new AccessTokenGuard(reflector, issuer).canActivate(context),
      ).rejects.toMatchObject({
        code: 'UNAUTHENTICATED',
      });
    }
  });
});
