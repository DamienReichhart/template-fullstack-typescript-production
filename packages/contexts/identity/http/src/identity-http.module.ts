import { Module, type DynamicModule, type Type } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { MeController } from './controllers/me.controller.js';
import { PasswordController } from './controllers/password.controller.js';
import { RegistrationController } from './controllers/registration.controller.js';
import { SessionController } from './controllers/session.controller.js';
import { AuthCookiesService } from './cookies/auth-cookies.service.js';
import { IdentityErrorMapper } from './errors/identity-error.mapper.js';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import { CsrfGuard } from './guards/csrf.guard.js';
import { EmailVerifiedGuard } from './guards/email-verified.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

export interface IdentityHttpModuleOptions {
  /** `IdentityApplicationModule.register(...)`: passed in, never imported, like every layer. */
  application: DynamicModule | Type;
}

/**
 * Identity endpoints and the app-wide guards they rely on, in order: CSRF, authentication
 * (every route is private unless `@Public()`), roles, verified email.
 */
@Module({})
export class IdentityHttpModule {
  static register({ application }: IdentityHttpModuleOptions): DynamicModule {
    return {
      module: IdentityHttpModule,
      imports: [application],
      controllers: [RegistrationController, SessionController, PasswordController, MeController],
      providers: [
        AuthCookiesService,
        IdentityErrorMapper,
        { provide: APP_GUARD, useClass: CsrfGuard },
        { provide: APP_GUARD, useClass: AccessTokenGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
        { provide: APP_GUARD, useClass: EmailVerifiedGuard },
      ],
      exports: [application],
    };
  }
}
