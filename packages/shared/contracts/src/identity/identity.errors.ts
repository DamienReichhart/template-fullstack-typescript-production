export const IdentityErrorCode = {
  emailAlreadyTaken: 'EMAIL_ALREADY_TAKEN',
  invalidCredentials: 'INVALID_CREDENTIALS',
  emailNotVerified: 'EMAIL_NOT_VERIFIED',
  sessionExpired: 'SESSION_EXPIRED',
  sessionRevoked: 'SESSION_REVOKED',
  sessionRefreshConflict: 'SESSION_REFRESH_CONFLICT',
  invalidOrExpiredToken: 'INVALID_OR_EXPIRED_TOKEN',
  avatarInvalid: 'AVATAR_INVALID',
  avatarUploadNotFound: 'AVATAR_UPLOAD_NOT_FOUND',
} as const;

export type IdentityErrorCode = (typeof IdentityErrorCode)[keyof typeof IdentityErrorCode];
