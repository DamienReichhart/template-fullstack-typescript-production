import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { OwnerId, VideoFile } from '@template/media-domain';

import { VideoStorage, type VideoUploadTicket } from '../../ports/storage/video-storage.port.ts';
import { RequestVideoUploadCommand } from './request-video-upload.command.ts';

/** Checks the announced file against the Video rules, then lets the browser send it. */
@CommandHandler(RequestVideoUploadCommand)
export class RequestVideoUploadHandler implements ICommandHandler<
  RequestVideoUploadCommand,
  VideoUploadTicket
> {
  constructor(private readonly storage: VideoStorage) {}

  async execute({
    ownerId,
    contentType,
    size,
  }: RequestVideoUploadCommand): Promise<VideoUploadTicket> {
    const file = VideoFile.create(contentType, size);
    return this.storage.issueUpload(OwnerId.from(ownerId).value, file);
  }
}
