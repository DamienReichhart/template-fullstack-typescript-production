import { Module, type DynamicModule, type Type } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { MeController } from './controllers/me.controller.ts';
import { PasswordController } from './controllers/password.controller.ts';
import { RegistrationController } from './controllers/registration.controller.ts';
import { SessionController } from './controllers/session.controller.ts';
import { AuthCookiesService } from './cookies/auth-cookies.service.ts';
import { IdentityErrorMapper } from './errors/identity-error.mapper.ts';
import { AccessTokenGuard } from './guards/access-token.guard.ts';
import { CsrfGuard } from './guards/csrf.guard.ts';
import { EmailVerifiedGuard } from './guards/email-verified.guard.ts';
import { RolesGuard } from './guards/roles.guard.ts';

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
