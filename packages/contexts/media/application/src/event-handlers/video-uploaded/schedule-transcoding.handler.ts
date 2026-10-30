import { Logger } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { VideoUploadedEvent } from '@template/media-domain';

import { VideoTranscoding } from '../../ports/processing/video-transcoding.port.ts';

/**
 * Policy: an uploaded Video is transcoded. Through a job, so the upload answers at once and a
 * failure is retried in the worker.
 */
@EventsHandler(VideoUploadedEvent)
export class ScheduleTranscodingHandler implements IEventHandler<VideoUploadedEvent> {
  private readonly logger = new Logger(ScheduleTranscodingHandler.name);

  constructor(private readonly transcoding: VideoTranscoding) {}

  async handle({ videoId, ownerId }: VideoUploadedEvent): Promise<void> {
    try {
      await this.transcoding.schedule(videoId);
    } catch (error) {
      this.logger.error({ err: error, videoId, ownerId }, 'Could not schedule transcoding');
    }
  }
}
