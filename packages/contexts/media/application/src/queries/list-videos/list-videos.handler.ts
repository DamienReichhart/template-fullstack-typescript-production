import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { OwnerId, VideoRepository } from '@template/media-domain';

import { VideoViews } from '../../services/video-views.service.ts';
import type { VideoView } from '../../views/video.view.ts';
import { ListVideosQuery } from './list-videos.query.ts';

@QueryHandler(ListVideosQuery)
export class ListVideosHandler implements IQueryHandler<ListVideosQuery, VideoView[]> {
  constructor(
    private readonly videos: VideoRepository,
    private readonly views: VideoViews,
  ) {}

  async execute({ ownerId }: ListVideosQuery): Promise<VideoView[]> {
    const videos = await this.videos.findByOwner(OwnerId.from(ownerId));
    return Promise.all(videos.map((video) => this.views.of(video)));
  }
}
