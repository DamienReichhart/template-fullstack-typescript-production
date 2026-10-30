import { HttpStatus, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CommonErrorCode } from '@template/contracts/common';
import { ApiProblemException, type AuthenticatedRequest } from '@template/http';
import type { UserRole } from '@template/identity-domain';

import { ROLES_KEY } from '../decorators/roles.decorator.ts';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user)
      throw new ApiProblemException(HttpStatus.UNAUTHORIZED, CommonErrorCode.unauthenticated);
    if (!(roles as readonly string[]).includes(user.role))
      throw new ApiProblemException(HttpStatus.FORBIDDEN, CommonErrorCode.forbidden);
    return true;
  }
}
