import { describe, expect, it } from 'bun:test';

import { apiPath, CommonErrorCode } from '@template/contracts/common';
import { IdentityErrorCode } from '@template/contracts/identity';
import {
  authenticatedPingResponseSchema,
  pingResponseSchema,
  SystemRoutes,
} from '@template/contracts/system';

import { ApiSession } from '../support/api-session.ts';
import { registerUser, verifiedUser } from '../support/users.ts';

const routes = SystemRoutes.system;
const pingPath = apiPath(routes.controller, routes.ping);
const authenticatedPingPath = apiPath(routes.controller, routes.authenticatedPing);

describe('ping', () => {
  it('reports the api and its dependencies to anyone', async () => {
    const response = await new ApiSession().get(pingPath);
    expect(response.status).toBe(200);
    expect(pingResponseSchema.parse(response.body)).toMatchObject({
      status: 'ok',
      services: { database: { status: 'up' }, redis: { status: 'up' } },
    });
  });

  it('requires a session for the authenticated ping', async () => {
    const response = await new ApiSession().get(authenticatedPingPath);
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ code: CommonErrorCode.unauthenticated });
  });

  it('requires a verified email for the authenticated ping', async () => {
    const { session } = await registerUser();
    const response = await session.get(authenticatedPingPath);
    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ code: IdentityErrorCode.emailNotVerified });
  });

  it('answers verified users with who they are', async () => {
    const { session, email } = await verifiedUser();
    const response = await session.get(authenticatedPingPath);
    expect(response.status).toBe(200);
    expect(authenticatedPingResponseSchema.parse(response.body).user).toMatchObject({
      email,
      role: 'USER',
    });
  });
});
