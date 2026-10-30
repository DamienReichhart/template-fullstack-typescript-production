import { Injectable } from '@nestjs/common';
import { VideoStorage, type VideoUploadTicket } from '@template/media-application';
import {
  InvalidVideoError,
  VIDEO_CONTENT_TYPES,
  VIDEO_MAX_BYTES,
  VideoUploadNotFoundError,
  type VideoFile,
} from '@template/media-domain';
import {
  DirectUploads,
  objectKey,
  ObjectStorage,
  UploadNotFoundError,
  UploadRejectedError,
} from '@template/storage';

/** Long enough to send 2 GB from a phone: the storage checks the expiry when the upload starts. */
const UPLOAD_TTL_SECONDS = 60 * 60;
/**
 * A player fetches a video in ranges for as long as it plays, each range checking the URL:
 * six hours (up to twelve, URLs are stable) outlasts any viewing.
 */
const PLAYBACK_URL_TTL_SECONDS = 6 * 3600;

const uploadScope = (ownerId: string) => ['media', 'videos', ownerId];

/**
 * Video files in object storage: the Source under `media/sources/<ownerId>/<videoId>`, the
 * Playable file under `media/videos/<ownerId>/<videoId>`. Uploads go from the browser to the
 * bucket (`DirectUploads`); the file is checked before it is kept.
 */
@Injectable()
export class ObjectStorageVideoStorage extends VideoStorage {
  constructor(
    private readonly storage: ObjectStorage,
    private readonly uploads: DirectUploads,
  ) {
    super();
  }

  async issueUpload(ownerId: string, file: VideoFile): Promise<VideoUploadTicket> {
    return this.uploads.issue({
      scope: uploadScope(ownerId),
      contentType: file.contentType,
      size: file.size,
      expiresInSeconds: UPLOAD_TTL_SECONDS,
    });
  }

  async keepSource(ownerId: string, uploadId: string, videoId: string): Promise<string> {
    try {
      const stored = await this.uploads.claim({
        scope: uploadScope(ownerId),
        uploadId,
        destinationKey: objectKey('media', 'sources', ownerId, videoId),
        rules: { contentTypes: VIDEO_CONTENT_TYPES, maxBytes: VIDEO_MAX_BYTES },
      });
      return stored.key;
    } catch (error) {
      if (error instanceof UploadNotFoundError) throw new VideoUploadNotFoundError(uploadId);
      if (error instanceof UploadRejectedError) throw new InvalidVideoError(error.reason);
      throw error;
    }
  }

  playableKeyOf(ownerId: string, videoId: string): string {
    return objectKey('media', 'videos', ownerId, videoId);
  }

  async urlOf(key: string): Promise<string> {
    const { url } = await this.storage.presignDownload(key, {
      expiresInSeconds: PLAYBACK_URL_TTL_SECONDS,
      stable: true,
    });
    return url;
  }

  async delete(key: string): Promise<void> {
    await this.storage.delete(key);
  }
}
