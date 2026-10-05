import { Module, type DynamicModule, type Type } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { LoginHandler } from './commands/login/login.handler.js';
import { LogoutHandler } from './commands/logout/logout.handler.js';
import { PurgeExpiredSessionsHandler } from './commands/purge-expired-sessions/purge-expired-sessions.handler.js';
import { RefreshSessionHandler } from './commands/refresh-session/refresh-session.handler.js';
import { RegisterUserHandler } from './commands/register-user/register-user.handler.js';
import { RequestPasswordResetHandler } from './commands/request-password-reset/request-password-reset.handler.js';
import { ResendEmailVerificationHandler } from './commands/resend-email-verification/resend-email-verification.handler.js';
import { ResetPasswordHandler } from './commands/reset-password/reset-password.handler.js';
import { VerifyEmailHandler } from './commands/verify-email/verify-email.handler.js';
import { SendPasswordResetEmailHandler } from './event-handlers/password-reset-requested/send-password-reset-email.handler.js';
import { SendOnboardingEmailsHandler } from './event-handlers/user-registered/send-onboarding-emails.handler.js';
import { GetCurrentUserHandler } from './queries/get-current-user/get-current-user.handler.js';
import { SessionIssuer } from './services/session-issuer.service.js';
import { VerificationEmailSender } from './services/verification-email.sender.js';

const commandHandlers = [
  RegisterUserHandler,
  VerifyEmailHandler,
  ResendEmailVerificationHandler,
  LoginHandler,
  RefreshSessionHandler,
  LogoutHandler,
  RequestPasswordResetHandler,
  ResetPasswordHandler,
  PurgeExpiredSessionsHandler,
];
const queryHandlers = [GetCurrentUserHandler];
const eventHandlers = [SendOnboardingEmailsHandler, SendPasswordResetEmailHandler];

export interface IdentityApplicationModuleOptions {
  /**
   * The module binding every port (repositories, hasher, token issuers, notifier,
   * settings, clock). Passed in so this layer never imports infrastructure.
   */
  infrastructure: DynamicModule | Type;
}

@Module({})
export class IdentityApplicationModule {
  static register({ infrastructure }: IdentityApplicationModuleOptions): DynamicModule {
    return {
      module: IdentityApplicationModule,
      imports: [CqrsModule, infrastructure],
      providers: [
        ...commandHandlers,
        ...queryHandlers,
        ...eventHandlers,
        SessionIssuer,
        VerificationEmailSender,
      ],
      exports: [CqrsModule, infrastructure],
    };
  }
}
