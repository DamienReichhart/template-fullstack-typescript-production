export { AuthCookiesService } from './cookies/auth-cookies.service.js';
export { identityCookieConfig, type IdentityCookieConfig } from './cookies/cookie-options.js';
export { Client } from './decorators/client-info.decorator.js';
export {
  CurrentUser,
  type AuthenticatedRequest,
  type AuthenticatedUser,
} from './decorators/current-user.decorator.js';
export { RequireVerifiedEmail } from './decorators/require-verified-email.decorator.js';
export { Roles } from './decorators/roles.decorator.js';
export { IdentityErrorMapper } from './errors/identity-error.mapper.js';
export { AccessTokenGuard } from './guards/access-token.guard.js';
export { IdentityHttpModule, type IdentityHttpModuleOptions } from './identity-http.module.js';
