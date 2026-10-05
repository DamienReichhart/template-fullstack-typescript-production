import { apiPath } from '@template/contracts/common';
import {
  currentUserResponseSchema,
  IdentityRoutes,
  type CurrentUserResponse,
  type ForgotPasswordRequest,
  type LoginRequest,
  type RegisterRequest,
  type ResendVerificationRequest,
  type ResetPasswordRequest,
  type VerifyEmailRequest,
} from '@template/contracts/identity';

import type { HttpClient } from '../core/http-client.ts';

const auth = (route: string) => apiPath(IdentityRoutes.auth.controller, route);
const routes = IdentityRoutes.auth;
/** A 401 from these endpoints is an answer (bad credentials, dead session), not a cue to refresh. */
const noRefresh = { refreshOnUnauthorized: false } as const;

export function identityEndpoints(client: HttpClient) {
  return {
    register: (body: RegisterRequest): Promise<CurrentUserResponse> =>
      client.post(auth(routes.register), body, { schema: currentUserResponseSchema, ...noRefresh }),
    login: (body: LoginRequest): Promise<CurrentUserResponse> =>
      client.post(auth(routes.login), body, { schema: currentUserResponseSchema, ...noRefresh }),
    logout: (): Promise<void> => client.post(auth(routes.logout), undefined, noRefresh),
    refreshSession: (): Promise<boolean> => client.refreshSession(),
    me: (): Promise<CurrentUserResponse> =>
      client.get(apiPath(IdentityRoutes.me.controller), { schema: currentUserResponseSchema }),
    verifyEmail: (body: VerifyEmailRequest): Promise<void> =>
      client.post(auth(routes.verifyEmail), body, noRefresh),
    resendVerification: (body: ResendVerificationRequest): Promise<void> =>
      client.post(auth(routes.resendVerification), body, noRefresh),
    forgotPassword: (body: ForgotPasswordRequest): Promise<void> =>
      client.post(auth(routes.forgotPassword), body, noRefresh),
    resetPassword: (body: ResetPasswordRequest): Promise<void> =>
      client.post(auth(routes.resetPassword), body, noRefresh),
  };
}

export type IdentityEndpoints = ReturnType<typeof identityEndpoints>;
