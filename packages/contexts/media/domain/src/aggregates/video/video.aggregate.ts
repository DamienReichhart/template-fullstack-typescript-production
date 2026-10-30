import { AggregateRoot } from '@template/ddd';

import { VideoNotProcessingError } from './errors/video-not-processing.error.ts';
import { VideoUploadedEvent } from './events/video-uploaded.event.ts';
import type { OwnerId } from './value-objects/owner-id.value-object.ts';
import type { PlayableFile } from './value-objects/playable-file.value-object.ts';
import type { VideoFailureReason } from './value-objects/video-failure-reason.value-object.ts';
import type { VideoId } from './value-objects/video-id.value-object.ts';
import type { VideoStatus } from './value-objects/video-status.value-object.ts';

export interface VideoProps {
  ownerId: OwnerId;
  status: VideoStatus;
  /**
   * Where the Source was stored. The file itself only exists while the Video is Processing:
   * it is deleted once the Video is Ready or Failed, the key stays so a retried deletion
   * knows what to delete.
   */
  sourceKey: string;
  /** Set once Ready, never before. */
  playableFile: PlayableFile | null;
  /** Set once Failed, never before. */
  failureReason: VideoFailureReason | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadVideoInput {
  id: VideoId;
  ownerId: OwnerId;
  sourceKey: string;
  now: Date;
}

/**
 * A recording a User uploaded. Processing until its Source is transcoded into the Playable
 * file, then Ready; or Failed, for good. Either way the Source does not outlive Processing.
 */
export class Video extends AggregateRoot<VideoId, VideoProps> {
  static upload({ id, ownerId, sourceKey, now }: UploadVideoInput): Video {
    const video = new Video(id, {
      ownerId,
      status: 'PROCESSING',
      sourceKey,
      playableFile: null,
      failureReason: null,
      createdAt: now,
      updatedAt: now,
    });
    video.addDomainEvent(new VideoUploadedEvent(id.value, ownerId.value, now));
    return video;
  }

  /** Rebuilds a Video from storage. Records no event: nothing happened. */
  static reconstitute(id: VideoId, props: VideoProps): Video {
    return new Video(id, props);
  }

  get ownerId(): OwnerId {
    return this.props.ownerId;
  }

  get status(): VideoStatus {
    return this.props.status;
  }

  get isProcessing(): boolean {
    return this.props.status === 'PROCESSING';
  }

  get sourceKey(): string {
    return this.props.sourceKey;
  }

  get playableFile(): PlayableFile | null {
    return this.props.playableFile;
  }

  get failureReason(): VideoFailureReason | null {
    return this.props.failureReason;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isOwnedBy(ownerId: OwnerId): boolean {
    return this.props.ownerId.equals(ownerId);
  }

  /** Transcoding produced `playableFile`: the Video can be played. */
  markReady(playableFile: PlayableFile, now: Date): void {
    this.assertProcessing();
    this.props.status = 'READY';
    this.props.playableFile = playableFile;
    this.props.updatedAt = now;
  }

  /** The Video will never be playable, for `reason`. */
  fail(reason: VideoFailureReason, now: Date): void {
    this.assertProcessing();
    this.props.status = 'FAILED';
    this.props.failureReason = reason;
    this.props.updatedAt = now;
  }

  private assertProcessing(): void {
    if (!this.isProcessing) throw new VideoNotProcessingError(this.id.value, this.props.status);
  }
}
