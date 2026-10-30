import { HttpStatus, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CommonErrorCode } from '@template/contracts/common';
import { IdentityErrorCode } from '@template/contracts/identity';
import {
  ApiProblemException,
  REQUIRE_VERIFIED_EMAIL_KEY,
  type AuthenticatedRequest,
} from '@template/http';

/**
 * Reads the `emailVerified` claim of the access token. Clients refresh their session right
 * after verifying an email so the claim catches up immediately.
 */
@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<boolean>(REQUIRE_VERIFIED_EMAIL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user)
      throw new ApiProblemException(HttpStatus.UNAUTHORIZED, CommonErrorCode.unauthenticated);
    if (!user.emailVerified)
      throw new ApiProblemException(HttpStatus.FORBIDDEN, IdentityErrorCode.emailNotVerified);
    return true;
  }
}
