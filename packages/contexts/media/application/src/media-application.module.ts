import { Module, type DynamicModule, type Type } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { RequestVideoUploadHandler } from './commands/request-video-upload/request-video-upload.handler.ts';
import { TranscodeVideoHandler } from './commands/transcode-video/transcode-video.handler.ts';
import { UploadVideoHandler } from './commands/upload-video/upload-video.handler.ts';
import { ScheduleTranscodingHandler } from './event-handlers/video-uploaded/schedule-transcoding.handler.ts';
import { GetVideoHandler } from './queries/get-video/get-video.handler.ts';
import { ListVideosHandler } from './queries/list-videos/list-videos.handler.ts';
import { VideoViews } from './services/video-views.service.ts';

const commandHandlers = [RequestVideoUploadHandler, UploadVideoHandler, TranscodeVideoHandler];
const queryHandlers = [GetVideoHandler, ListVideosHandler];
const eventHandlers = [ScheduleTranscodingHandler];

export interface MediaApplicationModuleOptions {
  /**
   * The module binding every port (video repository, storage, transcoder, transcoding queue,
   * clock). Passed in so this layer never imports infrastructure.
   */
  infrastructure: DynamicModule | Type;
}

@Module({})
export class MediaApplicationModule {
  static register({ infrastructure }: MediaApplicationModuleOptions): DynamicModule {
    return {
      module: MediaApplicationModule,
      imports: [CqrsModule, infrastructure],
      providers: [...commandHandlers, ...queryHandlers, ...eventHandlers, VideoViews],
      exports: [CqrsModule, infrastructure],
    };
  }
}
