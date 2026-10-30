import type { VideoFile } from '@template/media-domain';
import { InvalidVideoError, VideoUploadNotFoundError } from '@template/media-domain';

import { VideoStorage, type VideoUploadTicket } from '../../ports/storage/video-storage.port.ts';

interface Upload {
  ownerId: string;
  file: VideoFile;
  /** Set by `receive()`: what the browser actually sent. */
  sent?: { contentType: string; size: number };
}

/**
 * Video files in memory. `receive()` plays the browser sending a file for a ticket;
 * `keepSource()` applies the checks the real adapter makes (announced type must match).
 */
export class FakeVideoStorage extends VideoStorage {
  readonly uploads = new Map<string, Upload>();
  readonly files = new Set<string>();
  /** Every key `delete()` was called with, in order. */
  readonly deleted: string[] = [];
  private sequence = 0;

  async issueUpload(ownerId: string, file: VideoFile): Promise<VideoUploadTicket> {
    const uploadId = `00000000-0000-4000-8000-${String(++this.sequence).padStart(12, '0')}`;
    this.uploads.set(uploadId, { ownerId, file });
    return {
      uploadId,
      url: 'https://storage.test/bucket',
      fields: { key: `staging/${uploadId}`, 'Content-Type': file.contentType },
      expiresAt: new Date(Date.now() + 600_000),
    };
  }

  receive(uploadId: string, sent?: { contentType: string; size: number }): void {
    const upload = this.uploads.get(uploadId);
    if (upload) {
      upload.sent = sent ?? { contentType: upload.file.contentType, size: upload.file.size };
    }
  }

  async keepSource(ownerId: string, uploadId: string, videoId: string): Promise<string> {
    const upload = this.uploads.get(uploadId);
    if (!upload?.sent || upload.ownerId !== ownerId) throw new VideoUploadNotFoundError(uploadId);
    this.uploads.delete(uploadId);
    if (upload.sent.contentType !== upload.file.contentType) {
      throw new InvalidVideoError('content-mismatch');
    }
    const key = `media/sources/${ownerId}/${videoId}`;
    this.files.add(key);
    return key;
  }

  playableKeyOf(ownerId: string, videoId: string): string {
    return `media/videos/${ownerId}/${videoId}`;
  }

  async urlOf(key: string): Promise<string> {
    return `https://storage.test/bucket/${key}`;
  }

  async delete(key: string): Promise<void> {
    this.deleted.push(key);
    this.files.delete(key);
  }
}
