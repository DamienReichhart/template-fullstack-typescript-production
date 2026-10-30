import type { Video as VideoRecord } from '@template/database';
import {
  isVideoFailureReason,
  OwnerId,
  PlayableFile,
  Video,
  VideoId,
} from '@template/media-domain';

export const VideoMapper = {
  toDomain(record: VideoRecord): Video {
    const playableFile =
      record.fileKey === null
        ? null
        : PlayableFile.of({
            key: record.fileKey,
            size: Number(record.fileSize ?? 0),
            width: record.width ?? 0,
            height: record.height ?? 0,
            durationSeconds: record.durationSeconds ?? 0,
          });
    const reason = record.failureReason;
    return Video.reconstitute(VideoId.from(record.id), {
      ownerId: OwnerId.from(record.ownerId),
      status: record.status,
      sourceKey: record.sourceKey,
      playableFile,
      failureReason: reason !== null && isVideoFailureReason(reason) ? reason : null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  },

  toPersistence(video: Video): VideoRecord {
    const file = video.playableFile;
    return {
      id: video.id.value,
      ownerId: video.ownerId.value,
      status: video.status,
      sourceKey: video.sourceKey,
      fileKey: file?.key ?? null,
      fileSize: file ? BigInt(file.size) : null,
      width: file?.width ?? null,
      height: file?.height ?? null,
      durationSeconds: file?.durationSeconds ?? null,
      failureReason: video.failureReason,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
    };
  },
};
