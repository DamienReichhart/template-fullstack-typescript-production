import { apiPath } from '@template/contracts/common';
import {
  avatarUploadResponseSchema,
  currentUserResponseSchema,
  IdentityRoutes,
  type AvatarUploadRequest,
  type AvatarUploadResponse,
  type ChangeAvatarRequest,
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
const me = (route: string) => apiPath(IdentityRoutes.me.controller, route);
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
    /** Step 1 of changing the avatar; send the file with `uploadToStorage`, then `changeAvatar`. */
    requestAvatarUpload: (body: AvatarUploadRequest): Promise<AvatarUploadResponse> =>
      client.post(me(IdentityRoutes.me.avatarUploads), body, {
        schema: avatarUploadResponseSchema,
      }),
    changeAvatar: (body: ChangeAvatarRequest): Promise<CurrentUserResponse> =>
      client.put(me(IdentityRoutes.me.avatar), body, { schema: currentUserResponseSchema }),
    removeAvatar: (): Promise<CurrentUserResponse> =>
      client.delete(me(IdentityRoutes.me.avatar), { schema: currentUserResponseSchema }),
  };
}

export type IdentityEndpoints = ReturnType<typeof identityEndpoints>;
