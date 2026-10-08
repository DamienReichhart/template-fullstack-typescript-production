import type { AvatarImage } from '@template/identity-domain';

/** What the browser needs to send an Avatar straight to storage (an HTML form POST). */
export interface AvatarUploadTicket {
  uploadId: string;
  url: string;
  fields: Record<string, string>;
  expiresAt: Date;
}

/**
 * Where Avatar files live. Files are immutable: each Avatar gets its own key, and a replaced
 * one is deleted. Implemented over object storage by infrastructure.
 */
export abstract class AvatarStorage {
  /** Lets the User send exactly `image` (format and size) to storage, for a few minutes. */
  abstract issueUpload(userId: string, image: AvatarImage): Promise<AvatarUploadTicket>;

  /**
   * Checks the file the User sent under `uploadId` and keeps it as an Avatar; returns its key.
   * Throws `AvatarUploadNotFoundError`, or `InvalidAvatarError` (the file is then deleted).
   */
  abstract keep(userId: string, uploadId: string): Promise<string>;

  /** A URL the browser can display the Avatar from, valid at least an hour. */
  abstract urlOf(avatarKey: string): Promise<string>;

  /** Idempotent. */
  abstract delete(avatarKey: string): Promise<void>;
}
