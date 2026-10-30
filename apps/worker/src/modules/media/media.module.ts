import { Module } from '@nestjs/common';
import { MediaApplicationModule } from '@template/media-application';
import { MediaInfrastructureModule } from '@template/media-infrastructure';
import { MediaJobsModule } from '@template/media-jobs';

/** Video transcoding: consumes the `media` queue, runs ffmpeg (`FFMPEG_PATH`). */
@Module({
  imports: [
    MediaJobsModule.register({
      application: MediaApplicationModule.register({
        infrastructure: MediaInfrastructureModule.forRoot(),
      }),
    }),
  ],
})
export class MediaModule {}
