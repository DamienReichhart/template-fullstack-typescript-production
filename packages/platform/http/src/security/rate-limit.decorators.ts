import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'template:rate-limit';

export interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
}

/** Overrides the global budget, e.g. `@RateLimit({ limit: 5, windowSeconds: 60 })` on login. */
export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

/** Exempts a route or controller (health probes) from rate limiting. */
export const SkipRateLimit = () => SetMetadata(RATE_LIMIT_KEY, false);
