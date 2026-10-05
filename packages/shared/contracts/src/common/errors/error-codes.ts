/** Errors any endpoint can return. Context-specific codes live next to their context's contracts. */
export const CommonErrorCode = {
  badRequest: 'BAD_REQUEST',
  validationFailed: 'VALIDATION_FAILED',
  unauthenticated: 'UNAUTHENTICATED',
  forbidden: 'FORBIDDEN',
  notFound: 'NOT_FOUND',
  rateLimited: 'RATE_LIMITED',
  csrfTokenInvalid: 'CSRF_TOKEN_INVALID',
  internal: 'INTERNAL_ERROR',
} as const;

export type CommonErrorCode = (typeof CommonErrorCode)[keyof typeof CommonErrorCode];
