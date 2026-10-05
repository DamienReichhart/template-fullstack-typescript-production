/**
 * Route segments for the identity context. The API declares controllers with them and the
 * web client builds URLs from them, so a renamed route breaks the build, not production.
 */
export const IdentityRoutes = {
  auth: {
    controller: 'auth',
    register: 'register',
    verifyEmail: 'verify-email',
    resendVerification: 'verify-email/resend',
    login: 'login',
    refresh: 'refresh',
    logout: 'logout',
    csrf: 'csrf',
    forgotPassword: 'password/forgot',
    resetPassword: 'password/reset',
  },
  me: {
    controller: 'me',
  },
} as const;
