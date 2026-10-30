import { Module, type DynamicModule, type Type } from '@nestjs/common';

import { VideosController } from './controllers/videos.controller.ts';
import { MediaErrorMapper } from './errors/media-error.mapper.ts';

export interface MediaHttpModuleOptions {
  /** `MediaApplicationModule.register(...)`: passed in, never imported, like every layer. */
  application: DynamicModule | Type;
}

/**
 * Media endpoints. Authentication is the app's: identity's global guards set the caller that
 * `@CurrentUser()` reads and enforce `@RequireVerifiedEmail()`.
 */
@Module({})
export class MediaHttpModule {
  static register({ application }: MediaHttpModuleOptions): DynamicModule {
    return {
      module: MediaHttpModule,
      imports: [application],
      controllers: [VideosController],
      providers: [MediaErrorMapper],
      exports: [application],
    };
  }
}
