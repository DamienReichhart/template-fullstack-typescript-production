import { Module } from '@nestjs/common';
import { MediaApplicationModule } from '@template/media-application';
import { MediaHttpModule } from '@template/media-http';
import { MediaInfrastructureModule } from '@template/media-infrastructure';

/** The media context, wired for HTTP: `/api/v1/videos`. Transcoding runs in the worker. */
@Module({
  imports: [
    MediaHttpModule.register({
      application: MediaApplicationModule.register({
        infrastructure: MediaInfrastructureModule.forRoot(),
      }),
    }),
  ],
})
export class MediaModule {}
