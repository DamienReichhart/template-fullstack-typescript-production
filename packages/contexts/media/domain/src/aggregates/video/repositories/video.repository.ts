import type { OwnerId } from '../value-objects/owner-id.value-object.ts';
import type { VideoId } from '../value-objects/video-id.value-object.ts';
import type { Video } from '../video.aggregate.ts';

/** Port: implemented in the infrastructure layer, faked in application tests. */
export abstract class VideoRepository {
  abstract findById(id: VideoId): Promise<Video | null>;
  /** The Owner's Videos, newest first. */
  abstract findByOwner(ownerId: OwnerId): Promise<Video[]>;
  abstract save(video: Video): Promise<void>;
}
