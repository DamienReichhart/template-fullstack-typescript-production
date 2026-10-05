import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { UserRole } from '@template/identity-domain';
import type { Request } from 'express';

/** Who is calling, as proven by the access token. Set by `AccessTokenGuard`. */
export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  emailVerified: boolean;
}

export type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

/** `@CurrentUser() user: AuthenticatedUser` in any non-public handler. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser | undefined =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
