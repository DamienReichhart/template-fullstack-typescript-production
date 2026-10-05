import 'reflect-metadata';

import { describe, expect, it } from 'bun:test';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';

import { RolesGuard } from './roles.guard.ts';

function guardFor(roles: string[] | undefined, user?: { role: string }) {
  const reflector = { getAllAndOverride: () => roles } as unknown as Reflector;
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
  return () => new RolesGuard(reflector).canActivate(context);
}

describe('RolesGuard', () => {
  it('allows routes without role requirements', () => {
    expect(guardFor(undefined)()).toBe(true);
  });

  it('allows a user holding a required role', () => {
    expect(guardFor(['ADMIN'], { role: 'ADMIN' })()).toBe(true);
  });

  it('forbids a user without the required role', () => {
    expect(guardFor(['ADMIN'], { role: 'USER' })).toThrow(
      expect.objectContaining({ code: 'FORBIDDEN' }),
    );
  });
});
