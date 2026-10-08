import { createHash } from 'node:crypto';

import { assertObjectKey } from '../objects/object-key.ts';
import {
  ObjectStorage,
  type ByteRange,
  type ListObjectsOptions,
  type ObjectBody,
  type ObjectInfo,
  type ObjectPage,
  type ObjectStream,
  type PresignDownloadOptions,
  type PresignedDownload,
  type PresignedUpload,
  type PresignUploadOptions,
  type WriteObjectOptions,
} from '../objects/object-storage.ts';

interface StoredObject {
  bytes: Uint8Array;
  info: ObjectInfo;
}

async function toBytes(body: ObjectBody): Promise<Uint8Array> {
  if (typeof body === 'string') return new TextEncoder().encode(body);
  if (body instanceof Uint8Array) return body;
  if (body instanceof Blob) return new Uint8Array(await body.arrayBuffer());
  return new Uint8Array(await new Response(body as ReadableStream<Uint8Array>).arrayBuffer());
}

/**
 * `ObjectStorage` in a `Map`, for unit tests: same contract as `S3ObjectStorage` (null for
 * missing objects, idempotent deletes, key validation). Presigned URLs are fake but stable;
 * `completeUpload()` plays the browser posting a file to a presigned upload.
 */
export class InMemoryObjectStorage extends ObjectStorage {
  readonly objects = new Map<string, StoredObject>();
  /** Every upload ticket presigned so far, with the rules it was signed for. */
  readonly presignedUploads: (PresignedUpload & PresignUploadOptions)[] = [];

  constructor(readonly bucket = 'test-bucket') {
    super();
  }

  async put(key: string, body: ObjectBody, options: WriteObjectOptions): Promise<void> {
    assertObjectKey(key);
    const bytes = await toBytes(body);
    this.objects.set(key, {
      bytes,
      info: {
        key,
        size: bytes.byteLength,
        contentType: options.contentType,
        cacheControl: options.cacheControl,
        etag: `"${createHash('md5').update(bytes).digest('hex')}"`,
        lastModified: new Date(),
        metadata: { ...options.metadata },
      },
    });
  }

  async head(key: string): Promise<ObjectInfo | null> {
    assertObjectKey(key);
    const object = this.objects.get(key);
    return object ? { ...object.info } : null;
  }

  async read(key: string, range?: ByteRange): Promise<Uint8Array | null> {
    assertObjectKey(key);
    const object = this.objects.get(key);
    if (!object) return null;
    return range ? object.bytes.slice(range.start, range.end + 1) : object.bytes.slice();
  }

  async stream(key: string): Promise<ObjectStream | null> {
    const bytes = await this.read(key);
    const info = await this.head(key);
    if (!bytes || !info) return null;
    return { info, body: new Blob([bytes]).stream() };
  }

  async copy(
    sourceKey: string,
    destinationKey: string,
    options?: WriteObjectOptions,
  ): Promise<void> {
    assertObjectKey(destinationKey);
    const source = this.objects.get(sourceKey);
    if (!source) throw new Error(`NoSuchKey: ${sourceKey}`);
    await this.put(destinationKey, source.bytes, {
      contentType: source.info.contentType ?? 'application/octet-stream',
      cacheControl: source.info.cacheControl,
      metadata: source.info.metadata,
      ...options,
    });
  }

  async delete(key: string): Promise<void> {
    assertObjectKey(key);
    this.objects.delete(key);
  }

  async deleteMany(keys: readonly string[]): Promise<void> {
    for (const key of keys) await this.delete(key);
  }

  async list({ prefix = '', cursor, limit = 1000 }: ListObjectsOptions = {}): Promise<ObjectPage> {
    const matching = [...this.objects.values()]
      .map((object) => object.info)
      .filter(({ key }) => key.startsWith(prefix) && (!cursor || key > cursor))
      .sort((a, b) => (a.key < b.key ? -1 : 1));
    const page = matching.slice(0, limit);
    return {
      objects: page.map(({ key, size, etag, lastModified }) => ({ key, size, etag, lastModified })),
      nextCursor: matching.length > limit ? page.at(-1)?.key : undefined,
    };
  }

  async presignDownload(
    key: string,
    { expiresInSeconds = 900, downloadAs }: PresignDownloadOptions = {},
  ): Promise<PresignedDownload> {
    assertObjectKey(key);
    const query = downloadAs ? `?download=${encodeURIComponent(downloadAs)}` : '';
    return {
      url: `memory://${this.bucket}/${key}${query}`,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
    };
  }

  async presignUpload(key: string, options: PresignUploadOptions): Promise<PresignedUpload> {
    assertObjectKey(key);
    const upload: PresignedUpload = {
      url: `memory://${this.bucket}`,
      fields: { key, 'Content-Type': options.contentType },
      key,
      expiresAt: new Date(Date.now() + (options.expiresInSeconds ?? 600) * 1000),
    };
    this.presignedUploads.push({ ...upload, ...options });
    return upload;
  }

  ping(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * What the storage does when a browser posts `bytes` with a presigned form: enforces the
   * signed size range, then stores the file under the signed key.
   */
  async completeUpload(fields: Record<string, string>, bytes: Uint8Array | string): Promise<void> {
    const key = fields['key'] ?? '';
    const ticket = this.presignedUploads.find((upload) => upload.key === key);
    if (!ticket) throw new Error(`No presigned upload for ${key}`);
    const body = await toBytes(bytes);
    if (body.byteLength < (ticket.minBytes ?? 1) || body.byteLength > ticket.maxBytes) {
      throw new Error('EntityTooLarge or EntityTooSmall');
    }
    await this.put(key, body, { contentType: ticket.contentType });
  }
}
