import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { OwnerId, VideoId, VideoNotFoundError, VideoRepository } from '@template/media-domain';

import { VideoViews } from '../../services/video-views.service.ts';
import type { VideoView } from '../../views/video.view.ts';
import { GetVideoQuery } from './get-video.query.ts';

@QueryHandler(GetVideoQuery)
export class GetVideoHandler implements IQueryHandler<GetVideoQuery, VideoView> {
  constructor(
    private readonly videos: VideoRepository,
    private readonly views: VideoViews,
  ) {}

  async execute({ ownerId, videoId }: GetVideoQuery): Promise<VideoView> {
    const video = await this.videos.findById(VideoId.from(videoId));
    if (!video?.isOwnedBy(OwnerId.from(ownerId))) throw new VideoNotFoundError(videoId);
    return this.views.of(video);
  }
}
