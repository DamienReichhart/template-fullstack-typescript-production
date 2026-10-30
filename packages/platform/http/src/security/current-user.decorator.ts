import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Who is calling, as proven by the authentication guard the app installs (identity's
 * `AccessTokenGuard`). Lives here so every context can read the caller without importing
 * the context that authenticates them.
 */
export interface AuthenticatedUser {
  id: string;
  role: string;
  emailVerified: boolean;
}

export type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

/** `@CurrentUser() user: AuthenticatedUser` in any non-public handler. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser | undefined =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
