import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@template/identity-domain';

export const ROLES_KEY = 'identity:roles';

/** Restricts a route to users holding one of the roles, e.g. `@Roles('ADMIN')`. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
