import { Module, type DynamicModule, type Type } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ChangeAvatarHandler } from './commands/change-avatar/change-avatar.handler.ts';
import { DeleteAvatarFileHandler } from './commands/delete-avatar-file/delete-avatar-file.handler.ts';
import { LoginHandler } from './commands/login/login.handler.ts';
import { LogoutHandler } from './commands/logout/logout.handler.ts';
import { PurgeExpiredSessionsHandler } from './commands/purge-expired-sessions/purge-expired-sessions.handler.ts';
import { RefreshSessionHandler } from './commands/refresh-session/refresh-session.handler.ts';
import { RegisterUserHandler } from './commands/register-user/register-user.handler.ts';
import { RequestPasswordResetHandler } from './commands/request-password-reset/request-password-reset.handler.ts';
import { RemoveAvatarHandler } from './commands/remove-avatar/remove-avatar.handler.ts';
import { RequestAvatarUploadHandler } from './commands/request-avatar-upload/request-avatar-upload.handler.ts';
import { ResendEmailVerificationHandler } from './commands/resend-email-verification/resend-email-verification.handler.ts';
import { ResetPasswordHandler } from './commands/reset-password/reset-password.handler.ts';
import { VerifyEmailHandler } from './commands/verify-email/verify-email.handler.ts';
import { DeleteReplacedAvatarFileHandler } from './event-handlers/avatar-changed/delete-replaced-avatar-file.handler.ts';
import { SendPasswordResetEmailHandler } from './event-handlers/password-reset-requested/send-password-reset-email.handler.ts';
import { SendOnboardingEmailsHandler } from './event-handlers/user-registered/send-onboarding-emails.handler.ts';
import { GetCurrentUserHandler } from './queries/get-current-user/get-current-user.handler.ts';
import { CurrentUserViews } from './services/current-user-views.service.ts';
import { SessionIssuer } from './services/session-issuer.service.ts';
import { VerificationEmailSender } from './services/verification-email.sender.ts';

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
  RequestAvatarUploadHandler,
  ChangeAvatarHandler,
  RemoveAvatarHandler,
  DeleteAvatarFileHandler,
];
const queryHandlers = [GetCurrentUserHandler];
const eventHandlers = [
  SendOnboardingEmailsHandler,
  SendPasswordResetEmailHandler,
  DeleteReplacedAvatarFileHandler,
];

export interface IdentityApplicationModuleOptions {
  /**
   * The module binding every port (repositories, hasher, token issuers, notifier,
   * avatar storage, housekeeping, settings, clock). Passed in so this layer never imports infrastructure.
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
        CurrentUserViews,
      ],
      exports: [CqrsModule, infrastructure],
    };
  }
}
