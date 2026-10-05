import { Module, type DynamicModule, type Type } from '@nestjs/common';
import { MessagingModule } from '@template/messaging';
import { mailQueue } from '@template/queue';

import { MailProcessor } from './processors/mail.processor.ts';

export interface NotificationsJobsModuleOptions {
  /** `NotificationsApplicationModule.register(...)`: passed in, never imported. */
  application: DynamicModule | Type;
}

/** Queue consumers of the notifications context. Imported by the worker only. */
@Module({})
export class NotificationsJobsModule {
  static register({ application }: NotificationsJobsModuleOptions): DynamicModule {
    return {
      module: NotificationsJobsModule,
      imports: [application, MessagingModule.registerQueues(mailQueue)],
      providers: [MailProcessor],
    };
  }
}
