import {
  HttpStatus,
  Inject,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { httpConfig, type ConfigType } from '@template/config';
import { CommonErrorCode } from '@template/contracts/common';
import { InjectRedis, type Redis } from '@template/redis';
import type { Request, Response } from 'express';

import { ApiProblemException } from '../errors/api-problem.exception.ts';
import { RATE_LIMIT_KEY, type RateLimitOptions } from './rate-limit.decorators.ts';
import { RedisRateLimiter } from './redis-rate-limiter.ts';

/**
 * Global per-IP, per-route rate limit. Exposes the IETF `RateLimit-*` headers and
 * `Retry-After` on rejection. Behind a proxy, set `TRUST_PROXY=true` so `request.ip` is
 * the client address, not the proxy's.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limiter: RedisRateLimiter;
  private readonly defaults: RateLimitOptions;

  constructor(
    private readonly reflector: Reflector,
    @InjectRedis() redis: Redis,
    @Inject(httpConfig.token) config: ConfigType<typeof httpConfig>,
  ) {
    this.limiter = new RedisRateLimiter(redis);
    this.defaults = { limit: config.THROTTLE_LIMIT, windowSeconds: config.THROTTLE_TTL_SECONDS };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;

    const options = this.reflector.getAllAndOverride<RateLimitOptions | false | undefined>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (options === false) return true;
    const { limit, windowSeconds } = options ?? this.defaults;

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const route = `${context.getClass().name}.${context.getHandler().name}`;
    const result = await this.limiter.hit(
      `${route}:${request.ip ?? 'unknown'}`,
      limit,
      windowSeconds,
    );

    response.setHeader('RateLimit-Limit', limit);
    response.setHeader('RateLimit-Remaining', result.remaining);
    response.setHeader('RateLimit-Reset', result.resetInSeconds);

    if (result.blocked) {
      response.setHeader('Retry-After', result.resetInSeconds);
      throw new ApiProblemException(HttpStatus.TOO_MANY_REQUESTS, CommonErrorCode.rateLimited);
    }
    return true;
  }
}
