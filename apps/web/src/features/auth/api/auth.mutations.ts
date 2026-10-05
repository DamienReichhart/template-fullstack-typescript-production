import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '@template/contracts/identity';

import { api } from '@/shared/api/api-client';

/** Mutation functions of the auth feature; hooks add cache updates and navigation. */
export const authMutations = {
  login: (input: LoginRequest) => api.identity.login(input),
  register: (input: RegisterRequest) => api.identity.register(input),
  logout: () => api.identity.logout(),
  verifyEmail: (input: VerifyEmailRequest) => api.identity.verifyEmail(input),
  resendVerification: (input: ResendVerificationRequest) => api.identity.resendVerification(input),
  forgotPassword: (input: ForgotPasswordRequest) => api.identity.forgotPassword(input),
  resetPassword: (input: ResetPasswordRequest) => api.identity.resetPassword(input),
  /** Rotates the session so the access token reflects fresh claims (e.g. a verified email). */
  refreshSession: () => api.identity.refreshSession(),
};
