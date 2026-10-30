import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { Clock } from '@template/ddd';
import { OwnerId, Video, VideoId, VideoRepository } from '@template/media-domain';

import { VideoStorage } from '../../ports/storage/video-storage.port.ts';
import { UploadVideoCommand } from './upload-video.command.ts';

/**
 * Keeps the uploaded file as the Source of a new Video (checked by the storage adapter), then
 * records the Video. Transcoding is scheduled through `VideoUploaded`.
 */
@CommandHandler(UploadVideoCommand)
export class UploadVideoHandler implements ICommandHandler<UploadVideoCommand, string> {
  constructor(
    private readonly videos: VideoRepository,
    private readonly storage: VideoStorage,
    private readonly clock: Clock,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ ownerId, uploadId }: UploadVideoCommand): Promise<string> {
    const owner = OwnerId.from(ownerId);
    const id = VideoId.create();
    const sourceKey = await this.storage.keepSource(owner.value, uploadId, id.value);
    const video = Video.upload({ id, ownerId: owner, sourceKey, now: this.clock.now() });
    await this.videos.save(video);
    this.eventBus.publishAll(video.pullDomainEvents());
    return id.value;
  }
}
