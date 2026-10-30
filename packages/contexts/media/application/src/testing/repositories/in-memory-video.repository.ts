import { VideoRepository, type OwnerId, type Video, type VideoId } from '@template/media-domain';

export class InMemoryVideoRepository extends VideoRepository {
  readonly videos = new Map<string, Video>();

  async findById(id: VideoId): Promise<Video | null> {
    return this.videos.get(id.value) ?? null;
  }

  async findByOwner(ownerId: OwnerId): Promise<Video[]> {
    return [...this.videos.values()]
      .filter((video) => video.isOwnedBy(ownerId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async save(video: Video): Promise<void> {
    this.videos.set(video.id.value, video);
  }
}
