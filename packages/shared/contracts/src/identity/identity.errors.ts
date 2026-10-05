export const IdentityErrorCode = {
  emailAlreadyTaken: 'EMAIL_ALREADY_TAKEN',
  invalidCredentials: 'INVALID_CREDENTIALS',
  emailNotVerified: 'EMAIL_NOT_VERIFIED',
  sessionExpired: 'SESSION_EXPIRED',
  sessionRevoked: 'SESSION_REVOKED',
  invalidOrExpiredToken: 'INVALID_OR_EXPIRED_TOKEN',
} as const;

export type IdentityErrorCode = (typeof IdentityErrorCode)[keyof typeof IdentityErrorCode];
