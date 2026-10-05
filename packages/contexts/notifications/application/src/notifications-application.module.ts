import { Module, type DynamicModule, type Type } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { SendEmailVerificationHandler } from './commands/send-email-verification/send-email-verification.handler.js';
import { SendPasswordResetEmailHandler } from './commands/send-password-reset-email/send-password-reset-email.handler.js';
import { SendWelcomeEmailHandler } from './commands/send-welcome-email/send-welcome-email.handler.js';

export interface NotificationsApplicationModuleOptions {
  /** Binds `Mailer`, `EmailRenderer`, `WebLinks` and `Clock`. Passed in, never imported. */
  infrastructure: DynamicModule | Type;
}

@Module({})
export class NotificationsApplicationModule {
  static register({ infrastructure }: NotificationsApplicationModuleOptions): DynamicModule {
    return {
      module: NotificationsApplicationModule,
      imports: [CqrsModule, infrastructure],
      providers: [
        SendWelcomeEmailHandler,
        SendEmailVerificationHandler,
        SendPasswordResetEmailHandler,
      ],
      exports: [CqrsModule],
    };
  }
}
