import { Module, type DynamicModule, type Type } from '@nestjs/common';
import { MessagingModule } from '@template/messaging';
import { mediaQueue } from '@template/queue';

import { MediaProcessor } from './processors/media.processor.ts';

export interface MediaJobsModuleOptions {
  /** `MediaApplicationModule.register(...)`: passed in, never imported. */
  application: DynamicModule | Type;
}

/** Queue consumers of the media context. Imported by the worker only. */
@Module({})
export class MediaJobsModule {
  static register({ application }: MediaJobsModuleOptions): DynamicModule {
    return {
      module: MediaJobsModule,
      imports: [application, MessagingModule.registerQueues(mediaQueue)],
      providers: [MediaProcessor],
    };
  }
}
