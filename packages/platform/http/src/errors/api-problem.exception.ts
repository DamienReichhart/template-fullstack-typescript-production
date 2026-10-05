import { HttpException } from '@nestjs/common';

/**
 * Throw from presentation code for transport-level errors with a stable code
 * (e.g. an invalid CSRF token). Business rule violations are domain errors instead.
 */
export class ApiProblemException extends HttpException {
  constructor(
    status: number,
    readonly code: string,
    detail?: string,
  ) {
    super({ code, detail }, status);
  }
}
