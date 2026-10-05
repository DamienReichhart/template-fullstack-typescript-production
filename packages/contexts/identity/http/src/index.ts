export { AuthCookiesService } from './cookies/auth-cookies.service.ts';
export { identityCookieConfig, type IdentityCookieConfig } from './cookies/cookie-options.ts';
export { Client } from './decorators/client-info.decorator.ts';
export {
  CurrentUser,
  type AuthenticatedRequest,
  type AuthenticatedUser,
} from './decorators/current-user.decorator.ts';
export { RequireVerifiedEmail } from './decorators/require-verified-email.decorator.ts';
export { Roles } from './decorators/roles.decorator.ts';
export { IdentityErrorMapper } from './errors/identity-error.mapper.ts';
export { AccessTokenGuard } from './guards/access-token.guard.ts';
export { IdentityHttpModule, type IdentityHttpModuleOptions } from './identity-http.module.ts';
