import { describe, expect, it } from 'bun:test';
import type { ExecutionContext } from '@nestjs/common';

import { CsrfGuard } from './csrf.guard.ts';

function contextFor(method: string, cookie?: string, header?: string) {
  return {
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => ({
        method,
        cookies: cookie ? { tpl_csrf: cookie } : {},
        header: (name: string) => (name === 'x-csrf-token' ? header : undefined),
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('CsrfGuard', () => {
  const guard = new CsrfGuard();

  it('lets safe methods through', () => {
    expect(guard.canActivate(contextFor('GET'))).toBe(true);
  });

  it('accepts an unsafe request echoing the cookie in the header', () => {
    expect(guard.canActivate(contextFor('POST', 'abc', 'abc'))).toBe(true);
  });

  it('rejects a missing or mismatched header', () => {
    expect(() => guard.canActivate(contextFor('POST', 'abc'))).toThrow(
      expect.objectContaining({ code: 'CSRF_TOKEN_INVALID' }),
    );
    expect(() => guard.canActivate(contextFor('DELETE', 'abc', 'abd'))).toThrow(
      expect.objectContaining({ code: 'CSRF_TOKEN_INVALID' }),
    );
  });
});
