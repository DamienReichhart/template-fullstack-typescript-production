import { Logger } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Clock } from '@template/ddd';
import { RejectedVideoError, VideoId, VideoRepository, type Video } from '@template/media-domain';

import { VideoStorage } from '../../ports/storage/video-storage.port.ts';
import { VideoTranscoder } from '../../ports/transcoding/video-transcoder.port.ts';
import { TranscodeVideoCommand } from './transcode-video.command.ts';

/**
 * Turns the Source into the Playable file and settles the Video: Ready, or Failed when the
 * Source is refused or the last attempt fails. Then deletes the Source, so a settled Video keeps
 * at most one file. Safe to run again: a settled Video only has its Source deleted (again).
 */
@CommandHandler(TranscodeVideoCommand)
export class TranscodeVideoHandler implements ICommandHandler<TranscodeVideoCommand, void> {
  private readonly logger = new Logger(TranscodeVideoHandler.name);

  constructor(
    private readonly videos: VideoRepository,
    private readonly storage: VideoStorage,
    private readonly transcoder: VideoTranscoder,
    private readonly clock: Clock,
  ) {}

  async execute({ videoId, lastAttempt }: TranscodeVideoCommand): Promise<void> {
    const video = await this.videos.findById(VideoId.from(videoId));
    if (!video) return;
    if (video.isProcessing) await this.settle(video, lastAttempt);
    await this.storage.delete(video.sourceKey);
  }

  private async settle(video: Video, lastAttempt: boolean): Promise<void> {
    const playableKey = this.storage.playableKeyOf(video.ownerId.value, video.id.value);
    try {
      const file = await this.transcoder.transcode(video.sourceKey, playableKey, (source) =>
        source.assertAcceptable(),
      );
      video.markReady(file, this.clock.now());
    } catch (error) {
      // A failure after the upload would leave a Playable file nothing points to.
      await this.storage.delete(playableKey);
      if (error instanceof RejectedVideoError) {
        video.fail(error.reason, this.clock.now());
      } else if (lastAttempt) {
        this.logger.error({ err: error, videoId: video.id.value }, 'Transcoding failed for good');
        video.fail('processing-failed', this.clock.now());
      } else {
        throw error;
      }
    }
    await this.videos.save(video);
  }
}
