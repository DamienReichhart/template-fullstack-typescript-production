import { Module, type DynamicModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, DiscoveryModule } from '@nestjs/core';

import { ProblemDetailsFilter } from './errors/problem-details.filter.js';
import { RateLimitGuard } from './security/rate-limit.guard.js';
import { zodValidationProviders } from './validation/zod-validation.providers.js';

/**
 * Cross-cutting HTTP behaviour: RFC 9457 errors, Zod validation and serialisation, and the
 * Redis-backed rate limiter. Requires `RedisModule` and `ConfigModule` with `httpConfig`.
 */
@Module({})
export class HttpModule {
  static forRoot(): DynamicModule {
    return {
      module: HttpModule,
      imports: [DiscoveryModule],
      providers: [
        { provide: APP_FILTER, useClass: ProblemDetailsFilter },
        { provide: APP_GUARD, useClass: RateLimitGuard },
        ...zodValidationProviders,
      ],
    };
  }
}
