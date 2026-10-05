import { apiPath } from '@template/contracts/common';
import {
  authenticatedPingResponseSchema,
  pingResponseSchema,
  SystemRoutes,
  type AuthenticatedPingResponse,
  type PingResponse,
} from '@template/contracts/system';

import type { HttpClient } from '../core/http-client.ts';

const routes = SystemRoutes.system;

export function systemEndpoints(client: HttpClient) {
  return {
    ping: (): Promise<PingResponse> =>
      client.get(apiPath(routes.controller, routes.ping), {
        schema: pingResponseSchema,
        refreshOnUnauthorized: false,
      }),
    authenticatedPing: (): Promise<AuthenticatedPingResponse> =>
      client.get(apiPath(routes.controller, routes.authenticatedPing), {
        schema: authenticatedPingResponseSchema,
      }),
  };
}

export type SystemEndpoints = ReturnType<typeof systemEndpoints>;
