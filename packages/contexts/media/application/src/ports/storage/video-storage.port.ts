import type { VideoFile } from '@template/media-domain';

/** What the browser needs to send a Video straight to storage (an HTML form POST). */
export interface VideoUploadTicket {
  uploadId: string;
  url: string;
  fields: Record<string, string>;
  expiresAt: Date;
}

/**
 * Where the files of Videos live: the Source while it is transcoded, then the Playable file.
 * Implemented over object storage by infrastructure.
 */
export abstract class VideoStorage {
  /** Lets the Owner send exactly `file` (format and size) to storage, for a while. */
  abstract issueUpload(ownerId: string, file: VideoFile): Promise<VideoUploadTicket>;

  /**
   * Checks the file the Owner sent under `uploadId` and keeps it as the Source of `videoId`;
   * returns its key. Throws `VideoUploadNotFoundError`, or `InvalidVideoError` (the file is
   * then deleted).
   */
  abstract keepSource(ownerId: string, uploadId: string, videoId: string): Promise<string>;

  /** Where the Playable file of a Video goes. */
  abstract playableKeyOf(ownerId: string, videoId: string): string;

  /** A URL the browser can play the file from, valid at least an hour. */
  abstract urlOf(key: string): Promise<string>;

  /** Idempotent. */
  abstract delete(key: string): Promise<void>;
}
