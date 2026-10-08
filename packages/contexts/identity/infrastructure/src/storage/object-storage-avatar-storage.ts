import { Injectable } from '@nestjs/common';
import { AvatarStorage, type AvatarUploadTicket } from '@template/identity-application';
import {
  AVATAR_CONTENT_TYPES,
  AVATAR_MAX_BYTES,
  AvatarUploadNotFoundError,
  InvalidAvatarError,
  type AvatarImage,
} from '@template/identity-domain';
import {
  DirectUploads,
  objectKey,
  ObjectStorage,
  UploadNotFoundError,
  UploadRejectedError,
} from '@template/storage';

/** Uploads expire quickly: the browser posts right after asking. */
const UPLOAD_TTL_SECONDS = 5 * 60;
/** Display URLs are stable for an hour, so browsers cache the picture between page loads. */
const DISPLAY_URL_TTL_SECONDS = 3600;
/** An avatar key is never rewritten: whatever caches it may keep it forever. */
const IMMUTABLE = 'private, max-age=31536000, immutable';

const scope = (userId: string) => ['identity', 'avatars', userId];

/**
 * Avatars in object storage, under `identity/avatars/<userId>/<uploadId>` (the content type
 * is stored with the object). Uploads go
 * from the browser to the bucket (`DirectUploads`); the file is checked before it is kept.
 */
@Injectable()
export class ObjectStorageAvatarStorage extends AvatarStorage {
  constructor(
    private readonly storage: ObjectStorage,
    private readonly uploads: DirectUploads,
  ) {
    super();
  }

  async issueUpload(userId: string, image: AvatarImage): Promise<AvatarUploadTicket> {
    return this.uploads.issue({
      scope: scope(userId),
      contentType: image.contentType,
      size: image.size,
      expiresInSeconds: UPLOAD_TTL_SECONDS,
    });
  }

  async keep(userId: string, uploadId: string): Promise<string> {
    try {
      const stored = await this.uploads.claim({
        scope: scope(userId),
        uploadId,
        destinationKey: objectKey(...scope(userId), uploadId),
        rules: { contentTypes: AVATAR_CONTENT_TYPES, maxBytes: AVATAR_MAX_BYTES },
        cacheControl: IMMUTABLE,
      });
      return stored.key;
    } catch (error) {
      if (error instanceof UploadNotFoundError) throw new AvatarUploadNotFoundError(uploadId);
      if (error instanceof UploadRejectedError) throw new InvalidAvatarError(error.reason);
      throw error;
    }
  }

  async urlOf(avatarKey: string): Promise<string> {
    const { url } = await this.storage.presignDownload(avatarKey, {
      expiresInSeconds: DISPLAY_URL_TTL_SECONDS,
      stable: true,
    });
    return url;
  }

  async delete(avatarKey: string): Promise<void> {
    await this.storage.delete(avatarKey);
  }
}
