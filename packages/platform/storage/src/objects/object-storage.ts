import type { Readable } from 'node:stream';

export type ObjectBody = string | Uint8Array | Blob | ReadableStream<Uint8Array> | Readable;

export interface WriteObjectOptions {
  contentType: string;
  /** e.g. `private, max-age=31536000, immutable` for objects never rewritten under their key. */
  cacheControl?: string;
  contentDisposition?: string;
  /** Small string pairs stored with the object (`x-amz-meta-*`). Never secrets. */
  metadata?: Record<string, string>;
}

export interface ObjectInfo {
  key: string;
  size: number;
  contentType?: string;
  cacheControl?: string;
  etag?: string;
  lastModified?: Date;
  metadata: Record<string, string>;
}

export type ObjectSummary = Pick<ObjectInfo, 'key' | 'size' | 'etag' | 'lastModified'>;

export interface ObjectPage {
  objects: ObjectSummary[];
  /** Pass to the next `list()` call; absent on the last page. */
  nextCursor?: string;
}

export interface ListObjectsOptions {
  prefix?: string;
  cursor?: string;
  /** Page size, 1 to 1000. Defaults to 1000. */
  limit?: number;
}

/** Inclusive byte range, as in an HTTP `Range` header. */
export interface ByteRange {
  start: number;
  end: number;
}

export interface ObjectStream {
  info: ObjectInfo;
  body: ReadableStream<Uint8Array>;
}

export interface PresignDownloadOptions {
  /** Lifetime of the URL. Defaults to 15 minutes, at most 7 days. */
  expiresInSeconds?: number;
  /** Serve as an attachment saved under this name instead of displaying inline. */
  downloadAs?: string;
  /**
   * Sign for a time window instead of the current second: every call within one window returns
   * the same URL, so browsers and CDNs can cache what it points to. The URL then stays valid
   * between `expiresInSeconds` and twice that.
   */
  stable?: boolean;
}

export interface PresignedDownload {
  url: string;
  expiresAt: Date;
}

export interface PresignUploadOptions {
  /** The only content type the storage will accept for this upload. */
  contentType: string;
  /** Accepted size, in bytes: enforced by the storage itself, not by the client. */
  minBytes?: number;
  maxBytes: number;
  /** Lifetime of the form. Defaults to 10 minutes. */
  expiresInSeconds?: number;
}

/**
 * An HTML-form upload (S3 `POST Object`): send `fields`, then the file as the last field named
 * `file`, as `multipart/form-data` to `url`. The signed policy pins the key, the content type
 * and the size range, so a client cannot store anything else under that ticket.
 */
export interface PresignedUpload {
  url: string;
  fields: Record<string, string>;
  key: string;
  expiresAt: Date;
}

/**
 * One bucket of S3-compatible object storage. The only storage API the rest of the code
 * sees: `S3ObjectStorage` in apps, `InMemoryObjectStorage` (`@template/storage/testing`) in
 * unit tests. Missing objects are `null`, never errors; deletes are idempotent.
 */
export abstract class ObjectStorage {
  abstract readonly bucket: string;

  /** Stores `body` under `key`, replacing any object there. Streams of unknown length are fine. */
  abstract put(key: string, body: ObjectBody, options: WriteObjectOptions): Promise<void>;

  abstract head(key: string): Promise<ObjectInfo | null>;

  /** Reads the whole object (or `range`) into memory: for small objects and file signatures. */
  abstract read(key: string, range?: ByteRange): Promise<Uint8Array | null>;

  /** Streams the object: for anything that should not sit in memory at once. */
  abstract stream(key: string): Promise<ObjectStream | null>;

  /** Server-side copy; `options` replaces the destination's headers and metadata. */
  abstract copy(
    sourceKey: string,
    destinationKey: string,
    options?: WriteObjectOptions,
  ): Promise<void>;

  abstract delete(key: string): Promise<void>;

  /** Deletes in batches of 1000. Missing keys are ignored; any other failure throws. */
  abstract deleteMany(keys: readonly string[]): Promise<void>;

  /** One page of objects, in key order. */
  abstract list(options?: ListObjectsOptions): Promise<ObjectPage>;

  abstract presignDownload(
    key: string,
    options?: PresignDownloadOptions,
  ): Promise<PresignedDownload>;

  abstract presignUpload(key: string, options: PresignUploadOptions): Promise<PresignedUpload>;

  /** Resolves when the bucket answers; rejects with the reason otherwise. For readiness probes. */
  abstract ping(): Promise<void>;

  async exists(key: string): Promise<boolean> {
    return (await this.head(key)) !== null;
  }

  /** Every object under `prefix`, page after page. */
  async *listAll(prefix?: string): AsyncGenerator<ObjectSummary> {
    let cursor: string | undefined;
    do {
      const page = await this.list({ prefix, cursor });
      yield* page.objects;
      cursor = page.nextCursor;
    } while (cursor);
  }

  /** Deletes every object under `prefix`; returns how many there were. */
  async deletePrefix(prefix: string): Promise<number> {
    let deleted = 0;
    let batch: string[] = [];
    for await (const object of this.listAll(prefix)) {
      batch.push(object.key);
      if (batch.length === 1000) {
        await this.deleteMany(batch);
        deleted += batch.length;
        batch = [];
      }
    }
    await this.deleteMany(batch);
    return deleted + batch.length;
  }
}
