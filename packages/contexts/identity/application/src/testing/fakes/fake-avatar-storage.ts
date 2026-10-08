import type { AvatarImage } from '@template/identity-domain';
import { AvatarUploadNotFoundError, InvalidAvatarError } from '@template/identity-domain';

import { AvatarStorage, type AvatarUploadTicket } from '../../ports/storage/avatar-storage.port.ts';

interface Upload {
  userId: string;
  image: AvatarImage;
  /** Set by `receive()`: what the browser actually sent. */
  sent?: { contentType: string; size: number };
}

/**
 * Avatar files in memory. `receive()` plays the browser sending a file for a ticket; `keep()`
 * applies the checks the real adapter makes (announced size and type must match).
 */
export class FakeAvatarStorage extends AvatarStorage {
  readonly uploads = new Map<string, Upload>();
  readonly files = new Set<string>();
  private sequence = 0;

  async issueUpload(userId: string, image: AvatarImage): Promise<AvatarUploadTicket> {
    const uploadId = `00000000-0000-4000-8000-${String(++this.sequence).padStart(12, '0')}`;
    this.uploads.set(uploadId, { userId, image });
    return {
      uploadId,
      url: 'https://storage.test/bucket',
      fields: { key: `staging/${uploadId}`, 'Content-Type': image.contentType },
      expiresAt: new Date(Date.now() + 600_000),
    };
  }

  receive(uploadId: string, sent?: { contentType: string; size: number }): void {
    const upload = this.uploads.get(uploadId);
    if (upload)
      upload.sent = sent ?? { contentType: upload.image.contentType, size: upload.image.size };
  }

  async keep(userId: string, uploadId: string): Promise<string> {
    const upload = this.uploads.get(uploadId);
    if (!upload?.sent || upload.userId !== userId) throw new AvatarUploadNotFoundError(uploadId);
    this.uploads.delete(uploadId);
    if (upload.sent.contentType !== upload.image.contentType) {
      throw new InvalidAvatarError('content-mismatch');
    }
    const key = `identity/avatars/${userId}/${uploadId}`;
    this.files.add(key);
    return key;
  }

  async urlOf(avatarKey: string): Promise<string> {
    return `https://storage.test/bucket/${avatarKey}`;
  }

  async delete(avatarKey: string): Promise<void> {
    this.files.delete(avatarKey);
  }
}
