import { describe, expect, it } from 'bun:test';

import { CommonErrorCode } from '@template/contracts/common';
import { IdentityRoutes } from '@template/contracts/identity';

import { ApiSession } from '../support/api-session.ts';
import { authPath, promoteToAdmin, registerUser } from '../support/users.ts';

const BULL_BOARD = '/admin/queues';

describe('bull board', () => {
  it('rejects anonymous visitors', async () => {
    const response = await new ApiSession().get(BULL_BOARD);
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ code: CommonErrorCode.unauthenticated });
  });

  it('rejects signed-in users without the ADMIN role', async () => {
    const { session } = await registerUser();
    const response = await session.get(BULL_BOARD);
    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ code: CommonErrorCode.forbidden });
  });

  it('serves the dashboard to administrators', async () => {
    const { email, password } = await registerUser({ label: 'admin' });
    await promoteToAdmin(email);
    const admin = new ApiSession();
    expect(
      (await admin.post(authPath(IdentityRoutes.auth.login), { email, password })).status,
    ).toBe(200);

    const response = await admin.get(BULL_BOARD);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
  });
});
