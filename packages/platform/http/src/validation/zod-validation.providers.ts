import type { Provider } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

/**
 * Global Zod validation: request DTOs created with `createZodDto(schema)` are validated by
 * the pipe; handlers annotated with `@ZodResponse()` have their output serialised (and
 * stripped of undeclared fields) by the interceptor.
 */
export const zodValidationProviders: Provider[] = [
  { provide: APP_PIPE, useClass: ZodValidationPipe },
  { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
];
