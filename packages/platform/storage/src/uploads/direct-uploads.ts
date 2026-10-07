import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import {
  detectContentType,
  hasKnownSignature,
  SIGNATURE_BYTES,
} from '../content/content-signature.ts';
import { objectKey } from '../objects/object-key.ts';
import { ObjectStorage, type ObjectInfo } from '../objects/object-storage.ts';
import { UploadNotFoundError, UploadRejectedError } from './upload-errors.ts';

/**
 * Where browsers upload before the server accepts a file. The bucket expires everything under
 * it after a day (`bun run storage:provision`), so abandoned uploads clean themselves up.
 */
export const STAGING_PREFIX = 'staging';

const UPLOAD_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export interface IssueUploadInput {
  /**
   * Who may claim the upload, as key segments: `['identity', 'avatars', userId]`. Rebuilt
   * from the authenticated caller on claim, so one user can never claim another's upload.
   */
  scope: readonly string[];
  contentType: string;
  /** Exact size the client announced: the storage refuses any other. */
  size: number;
  expiresInSeconds?: number;
}

export interface UploadTicket {
  uploadId: string;
  /** Form target and fields: see `PresignedUpload`. */
  url: string;
  fields: Record<string, string>;
  expiresAt: Date;
}

export interface UploadRules {
  contentTypes: readonly string[];
  maxBytes: number;
}

export interface ClaimUploadInput {
  scope: readonly string[];
  uploadId: string;
  /** Final key of the file, e.g. `identity/avatars/<userId>/<uploadId>.webp`. */
  destinationKey: string;
  /** Checked again server-side: the ticket's policy is the storage's promise, not ours. */
  rules: UploadRules;
  cacheControl?: string;
}

/**
 * Uploads that go from the browser straight to object storage, never through the api:
 *
 * 1. `issue()` returns a ticket: a form POST, signed for one staging key, content type and size.
 * 2. The browser posts the file to the storage.
 * 3. `claim()` checks what actually arrived (size, declared type, file signature), moves it to
 *    its final key and deletes the staged copy. A file that breaks the rules is deleted.
 */
@Injectable()
export class DirectUploads {
  constructor(private readonly storage: ObjectStorage) {}

  async issue({
    scope,
    contentType,
    size,
    expiresInSeconds,
  }: IssueUploadInput): Promise<UploadTicket> {
    const uploadId = randomUUID();
    const upload = await this.storage.presignUpload(this.stagingKey(scope, uploadId), {
      contentType,
      minBytes: size,
      maxBytes: size,
      expiresInSeconds,
    });
    return { uploadId, url: upload.url, fields: upload.fields, expiresAt: upload.expiresAt };
  }

  async claim({
    scope,
    uploadId,
    destinationKey,
    rules,
    cacheControl,
  }: ClaimUploadInput): Promise<ObjectInfo> {
    if (!UPLOAD_ID.test(uploadId)) throw new UploadNotFoundError(uploadId);
    const stagingKey = this.stagingKey(scope, uploadId);
    const staged = await this.storage.head(stagingKey);
    if (!staged) throw new UploadNotFoundError(uploadId);

    const contentType = staged.contentType ?? 'application/octet-stream';
    const rejection = await this.check(stagingKey, staged, contentType, rules);
    if (rejection) {
      await this.storage.delete(stagingKey);
      throw new UploadRejectedError(uploadId, rejection);
    }

    await this.storage.copy(stagingKey, destinationKey, { contentType, cacheControl });
    await this.storage.delete(stagingKey);
    const stored = await this.storage.head(destinationKey);
    if (!stored) throw new UploadNotFoundError(uploadId);
    return stored;
  }

  /** Drops a staged upload the caller no longer wants. Idempotent. */
  async discard(scope: readonly string[], uploadId: string): Promise<void> {
    if (UPLOAD_ID.test(uploadId)) await this.storage.delete(this.stagingKey(scope, uploadId));
  }

  private async check(
    stagingKey: string,
    staged: ObjectInfo,
    contentType: string,
    rules: UploadRules,
  ): Promise<UploadRejectedError['reason'] | undefined> {
    if (staged.size === 0) return 'empty';
    if (staged.size > rules.maxBytes) return 'too-large';
    if (!rules.contentTypes.includes(contentType)) return 'content-type';
    if (hasKnownSignature(contentType)) {
      const head = await this.storage.read(stagingKey, { start: 0, end: SIGNATURE_BYTES - 1 });
      if (!head || detectContentType(head) !== contentType) return 'content-mismatch';
    }
    return undefined;
  }

  private stagingKey(scope: readonly string[], uploadId: string): string {
    return objectKey(STAGING_PREFIX, ...scope, uploadId);
  }
}
