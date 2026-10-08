import {
  CommonErrorCode,
  problemDetailsSchema,
  type FieldError,
  type ProblemDetails,
} from '@template/contracts/common';

/** Errors raised by the client itself, never by the API. */
export const ClientErrorCode = {
  network: 'NETWORK_ERROR',
  /** Object storage refused or never received a direct upload. */
  uploadFailed: 'UPLOAD_FAILED',
  unknown: 'UNKNOWN',
} as const;

/**
 * Every failed call surfaces as an `ApiError` carrying the stable `code` of the RFC 9457
 * problem returned by the API. UIs translate `code`; they never parse messages.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly problem?: ProblemDetails,
  ) {
    super(problem?.detail ?? problem?.title ?? code);
    this.name = 'ApiError';
  }

  get fieldErrors(): FieldError[] {
    return this.problem?.errors ?? [];
  }

  get requestId(): string | undefined {
    return this.problem?.requestId;
  }

  is(code: string): boolean {
    return this.code === code;
  }

  static network(): ApiError {
    return new ApiError(0, ClientErrorCode.network);
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const body: unknown = await response.json().catch(() => undefined);
    const parsed = problemDetailsSchema.safeParse(body);
    if (parsed.success) return new ApiError(response.status, parsed.data.code, parsed.data);
    const code = response.status >= 500 ? CommonErrorCode.internal : ClientErrorCode.unknown;
    return new ApiError(response.status, code);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
