import { describe, expect, it } from 'bun:test';
import {
  EmailAlreadyTakenError,
  RefreshTokenAlreadyRotatedError,
  RefreshTokenReuseDetectedError,
} from '@template/identity-domain';

import { IdentityErrorMapper } from './identity-error.mapper.ts';

const mapper = new IdentityErrorMapper();

describe('IdentityErrorMapper', () => {
  it('maps identity errors to stable codes', () => {
    expect(mapper.map(new EmailAlreadyTakenError())).toEqual({
      status: 409,
      code: 'EMAIL_ALREADY_TAKEN',
    });
    expect(mapper.map(new RefreshTokenReuseDetectedError())).toEqual({
      status: 401,
      code: 'SESSION_REVOKED',
    });
    expect(mapper.map(new RefreshTokenAlreadyRotatedError())).toEqual({
      status: 409,
      code: 'SESSION_REFRESH_CONFLICT',
    });
  });

  it('ignores errors of other contexts', () => {
    expect(mapper.map(new Error('unrelated'))).toBeUndefined();
  });
});
