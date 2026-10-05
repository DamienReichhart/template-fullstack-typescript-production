import { HttpStatus, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthCookies, CommonErrorCode } from '@template/contracts/common';
import { ApiProblemException, IS_PUBLIC_KEY } from '@template/http';
import { AccessTokenIssuer } from '@template/identity-application';

import type { AuthenticatedRequest } from '../decorators/current-user.decorator.js';

/** Authenticates every non-`@Public()` route from the httpOnly access-token cookie. */
@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokens: AccessTokenIssuer,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = (request.cookies as Record<string, string> | undefined)?.[
      AuthCookies.accessToken
    ];
    if (!token)
      throw new ApiProblemException(HttpStatus.UNAUTHORIZED, CommonErrorCode.unauthenticated);

    try {
      const claims = await this.accessTokens.verify(token);
      request.user = { id: claims.userId, role: claims.role, emailVerified: claims.emailVerified };
      return true;
    } catch {
      throw new ApiProblemException(HttpStatus.UNAUTHORIZED, CommonErrorCode.unauthenticated);
    }
  }
}
