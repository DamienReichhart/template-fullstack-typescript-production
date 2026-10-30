import { Module, type DynamicModule } from '@nestjs/common';
import { Clock, SystemClock } from '@template/ddd';
import { VideoStorage, VideoTranscoder, VideoTranscoding } from '@template/media-application';
import { VideoRepository } from '@template/media-domain';
import { MessagingModule } from '@template/messaging';
import { mediaQueue } from '@template/queue';

import { BullMqVideoTranscoding } from './messaging/bullmq-video-transcoding.ts';
import { PrismaVideoRepository } from './persistence/repositories/prisma-video.repository.ts';
import { ObjectStorageVideoStorage } from './storage/object-storage-video-storage.ts';
import { FfmpegVideoTranscoder } from './transcoding/ffmpeg-video-transcoder.ts';

const ports = [VideoRepository, VideoStorage, VideoTranscoder, VideoTranscoding, Clock];

/**
 * Binds every port of the media application layer to a real adapter. Requires the app to
 * import `DatabaseModule`, `MessagingModule.forRoot()`, `StorageModule` and `ConfigModule`
 * with `mediaConfig` and `storageConfig`.
 */
@Module({})
export class MediaInfrastructureModule {
  static forRoot(): DynamicModule {
    return {
      module: MediaInfrastructureModule,
      imports: [MessagingModule.registerQueues(mediaQueue)],
      providers: [
        { provide: VideoRepository, useClass: PrismaVideoRepository },
        { provide: VideoStorage, useClass: ObjectStorageVideoStorage },
        { provide: VideoTranscoder, useClass: FfmpegVideoTranscoder },
        { provide: VideoTranscoding, useClass: BullMqVideoTranscoding },
        { provide: Clock, useClass: SystemClock },
      ],
      exports: ports,
    };
  }
}
