import { Injectable } from '@nestjs/common';
import { AuthCookies, CommonErrorCode } from '@template/contracts/common';
import { createProblem } from '@template/http';
import { AccessTokenIssuer } from '@template/identity-application';
import type { NextFunction, Request, Response } from 'express';

/**
 * Bull Board is mounted outside Nest's router, so Nest guards do not run there: this
 * middleware applies the same rule by hand. Only ADMIN users get through.
 */
@Injectable()
export class BullBoardAuthMiddleware {
  constructor(private readonly accessTokens: AccessTokenIssuer) {}

  readonly use = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    const deny = (status: number, code: string) =>
      response
        .status(status)
        .type('application/problem+json')
        .json(createProblem({ status, code, instance: request.originalUrl }));

    const token = (request.cookies as Record<string, string> | undefined)?.[
      AuthCookies.accessToken
    ];
    if (!token) return void deny(401, CommonErrorCode.unauthenticated);
    try {
      const claims = await this.accessTokens.verify(token);
      if (claims.role !== 'ADMIN') return void deny(403, CommonErrorCode.forbidden);
      next();
    } catch {
      deny(401, CommonErrorCode.unauthenticated);
    }
  };
}
