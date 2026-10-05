import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { CommonErrorCode, type FieldError, type ProblemDetails } from '@template/contracts/common';
import type { Request, Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import type { z } from 'zod';

import { ApiProblemException } from './api-problem.exception.ts';
import { DomainErrorMapper } from './error-mapper.ts';
import { createProblem } from './problem-details.factory.ts';

const CODE_BY_STATUS: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: CommonErrorCode.badRequest,
  [HttpStatus.UNAUTHORIZED]: CommonErrorCode.unauthenticated,
  [HttpStatus.FORBIDDEN]: CommonErrorCode.forbidden,
  [HttpStatus.NOT_FOUND]: CommonErrorCode.notFound,
  [HttpStatus.TOO_MANY_REQUESTS]: CommonErrorCode.rateLimited,
};

const ISSUE_PARAMS = ['minimum', 'maximum', 'expected', 'format'] as const;

function toFieldErrors(error: z.ZodError): FieldError[] {
  return error.issues.map((issue) => {
    const params = Object.fromEntries(
      ISSUE_PARAMS.flatMap((key) => {
        const value = (issue as unknown as Record<string, unknown>)[key];
        return typeof value === 'string' || typeof value === 'number' ? [[key, value]] : [];
      }),
    );
    return {
      path: issue.path.join('.'),
      message: issue.message,
      ...(Object.keys(params).length > 0 ? { params } : {}),
    };
  });
}

/**
 * The single place where errors become HTTP responses. Every error leaves the API as an
 * RFC 9457 problem with a stable `code` the client can translate; unknown errors are
 * logged and returned as an opaque 500.
 */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter, OnApplicationBootstrap {
  private readonly logger = new Logger(ProblemDetailsFilter.name);
  private mappers: DomainErrorMapper[] = [];

  constructor(private readonly discovery: DiscoveryService) {}

  onApplicationBootstrap(): void {
    this.mappers = this.discovery
      .getProviders()
      .map((wrapper) => wrapper.instance as unknown)
      .filter((instance): instance is DomainErrorMapper => instance instanceof DomainErrorMapper);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request & { id?: string }>();
    const response = http.getResponse<Response>();

    const problem = this.toProblem(exception, request.originalUrl, request.id);
    if (problem.status >= 500) {
      this.logger.error({ err: exception, requestId: request.id }, 'Unhandled exception');
    }
    response.status(problem.status).type('application/problem+json').json(problem);
  }

  private toProblem(exception: unknown, instance: string, requestId?: string): ProblemDetails {
    const base = { instance, requestId };

    if (exception instanceof ZodValidationException) {
      return createProblem({
        ...base,
        status: HttpStatus.BAD_REQUEST,
        code: CommonErrorCode.validationFailed,
        errors: toFieldErrors(exception.getZodError() as z.ZodError),
      });
    }
    if (exception instanceof ApiProblemException) {
      const { detail } = exception.getResponse() as { detail?: string };
      return createProblem({
        ...base,
        status: exception.getStatus(),
        code: exception.code,
        detail,
      });
    }
    for (const mapper of this.mappers) {
      const mapped = mapper.map(exception);
      if (mapped) return createProblem({ ...base, ...mapped });
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const code =
        CODE_BY_STATUS[status] ??
        (status >= 500 ? CommonErrorCode.internal : CommonErrorCode.badRequest);
      return createProblem({ ...base, status, code });
    }
    return createProblem({
      ...base,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: CommonErrorCode.internal,
    });
  }
}
