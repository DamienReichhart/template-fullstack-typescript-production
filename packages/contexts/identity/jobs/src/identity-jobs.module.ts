import { Module, type DynamicModule, type Type } from '@nestjs/common';
import { MessagingModule } from '@template/messaging';
import { identityMaintenanceQueue } from '@template/queue';

import { IdentityMaintenanceProcessor } from './processors/identity-maintenance.processor.ts';

export interface IdentityJobsModuleOptions {
  /** `IdentityApplicationModule.register(...)`: passed in, never imported. */
  application: DynamicModule | Type;
}

/** Queue consumers of the identity context. Imported by the worker only. */
@Module({})
export class IdentityJobsModule {
  static register({ application }: IdentityJobsModuleOptions): DynamicModule {
    return {
      module: IdentityJobsModule,
      imports: [application, MessagingModule.registerQueues(identityMaintenanceQueue)],
      providers: [IdentityMaintenanceProcessor],
    };
  }
}
