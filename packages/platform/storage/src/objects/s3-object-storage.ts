import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { S3Clients } from '../client/create-s3-clients.ts';
import { assertObjectKey } from './object-key.ts';
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
} from './object-storage.ts';

const DEFAULT_DOWNLOAD_TTL_SECONDS = 15 * 60;
const DEFAULT_UPLOAD_TTL_SECONDS = 10 * 60;
const MAX_PRESIGN_TTL_SECONDS = 7 * 24 * 3600;
const DELETE_BATCH = 1000;
const PING_TIMEOUT_MS = 2_000;

/** S3 answers 404 for a missing object, with `NotFound` (HEAD) or `NoSuchKey` (GET). */
function isNotFound(error: unknown): boolean {
  const candidate = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return (
    candidate?.$metadata?.httpStatusCode === 404 ||
    candidate?.name === 'NotFound' ||
    candidate?.name === 'NoSuchKey'
  );
}

/** `CopySource` is `bucket/key`, URL-encoded per segment. */
const copySource = (bucket: string, key: string) =>
  `${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;

const contentDisposition = (filename: string) =>
  `attachment; filename="${filename.replace(/["\\\r\n]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(filename)}`;

/** `ObjectStorage` over any S3-compatible API (RustFS, MinIO, AWS S3, Cloudflare R2, …). */
export class S3ObjectStorage extends ObjectStorage {
  constructor(
    private readonly clients: S3Clients,
    readonly bucket: string,
    private readonly now: () => Date = () => new Date(),
  ) {
    super();
  }

  async put(key: string, body: ObjectBody, options: WriteObjectOptions): Promise<void> {
    assertObjectKey(key);
    // Multipart when the body is large or of unknown length, a single PUT otherwise.
    await new Upload({
      client: this.clients.internal,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: options.contentType,
        CacheControl: options.cacheControl,
        ContentDisposition: options.contentDisposition,
        Metadata: options.metadata,
      },
    }).done();
  }

  async head(key: string): Promise<ObjectInfo | null> {
    assertObjectKey(key);
    try {
      const output = await this.clients.internal.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return {
        key,
        size: output.ContentLength ?? 0,
        contentType: output.ContentType,
        cacheControl: output.CacheControl,
        etag: output.ETag,
        lastModified: output.LastModified,
        metadata: output.Metadata ?? {},
      };
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async read(key: string, range?: ByteRange): Promise<Uint8Array | null> {
    const object = await this.get(key, range);
    return object ? object.Body.transformToByteArray() : null;
  }

  async stream(key: string): Promise<ObjectStream | null> {
    const object = await this.get(key);
    if (!object) return null;
    return {
      info: {
        key,
        size: object.ContentLength ?? 0,
        contentType: object.ContentType,
        cacheControl: object.CacheControl,
        etag: object.ETag,
        lastModified: object.LastModified,
        metadata: object.Metadata ?? {},
      },
      body: object.Body.transformToWebStream(),
    };
  }

  async copy(
    sourceKey: string,
    destinationKey: string,
    options?: WriteObjectOptions,
  ): Promise<void> {
    assertObjectKey(sourceKey);
    assertObjectKey(destinationKey);
    await this.clients.internal.send(
      new CopyObjectCommand({
        Bucket: this.bucket,
        Key: destinationKey,
        CopySource: copySource(this.bucket, sourceKey),
        ...(options && {
          MetadataDirective: 'REPLACE',
          ContentType: options.contentType,
          CacheControl: options.cacheControl,
          ContentDisposition: options.contentDisposition,
          Metadata: options.metadata,
        }),
      }),
    );
  }

  async delete(key: string): Promise<void> {
    assertObjectKey(key);
    await this.clients.internal.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async deleteMany(keys: readonly string[]): Promise<void> {
    for (const key of keys) assertObjectKey(key);
    for (let start = 0; start < keys.length; start += DELETE_BATCH) {
      const batch = keys.slice(start, start + DELETE_BATCH);
      const output = await this.clients.internal.send(
        new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
        }),
      );
      const failures = (output.Errors ?? []).filter((error) => error.Code !== 'NoSuchKey');
      if (failures.length > 0) {
        const detail = failures.map((error) => `${error.Key}: ${error.Code}`).join(', ');
        throw new Error(`Could not delete ${failures.length} object(s): ${detail}`);
      }
    }
  }

  async list({ prefix, cursor, limit = 1000 }: ListObjectsOptions = {}): Promise<ObjectPage> {
    const output = await this.clients.internal.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        ContinuationToken: cursor,
        MaxKeys: Math.min(Math.max(limit, 1), 1000),
      }),
    );
    return {
      objects: (output.Contents ?? []).map((object) => ({
        key: object.Key ?? '',
        size: object.Size ?? 0,
        etag: object.ETag,
        lastModified: object.LastModified,
      })),
      nextCursor: output.IsTruncated ? output.NextContinuationToken : undefined,
    };
  }

  async presignDownload(
    key: string,
    {
      expiresInSeconds = DEFAULT_DOWNLOAD_TTL_SECONDS,
      downloadAs,
      stable = false,
    }: PresignDownloadOptions = {},
  ): Promise<PresignedDownload> {
    assertObjectKey(key);
    const now = this.now();
    let signingDate = now;
    let expiresIn = expiresInSeconds;
    if (stable) {
      const windowMs = expiresInSeconds * 1000;
      signingDate = new Date(Math.floor(now.getTime() / windowMs) * windowMs);
      expiresIn = expiresInSeconds * 2;
    }
    expiresIn = Math.min(expiresIn, MAX_PRESIGN_TTL_SECONDS);
    const url = await getSignedUrl(
      this.clients.signer,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ResponseContentDisposition: downloadAs ? contentDisposition(downloadAs) : undefined,
      }),
      { expiresIn, signingDate },
    );
    return { url, expiresAt: new Date(signingDate.getTime() + expiresIn * 1000) };
  }

  async presignUpload(
    key: string,
    {
      contentType,
      minBytes = 1,
      maxBytes,
      expiresInSeconds = DEFAULT_UPLOAD_TTL_SECONDS,
    }: PresignUploadOptions,
  ): Promise<PresignedUpload> {
    assertObjectKey(key);
    const { url, fields } = await createPresignedPost(this.clients.signer, {
      Bucket: this.bucket,
      Key: key,
      Fields: { 'Content-Type': contentType },
      Conditions: [
        ['eq', '$Content-Type', contentType],
        ['content-length-range', minBytes, maxBytes],
      ],
      Expires: expiresInSeconds,
    });
    return {
      url,
      fields,
      key,
      expiresAt: new Date(this.now().getTime() + expiresInSeconds * 1000),
    };
  }

  async ping(): Promise<void> {
    try {
      await this.clients.internal.send(new HeadBucketCommand({ Bucket: this.bucket }), {
        abortSignal: AbortSignal.timeout(PING_TIMEOUT_MS),
      });
    } catch (error) {
      if (isNotFound(error)) {
        throw new Error(
          `Bucket "${this.bucket}" does not exist: run \`bun run storage:provision\``,
          {
            cause: error,
          },
        );
      }
      throw error;
    }
  }

  private async get(key: string, range?: ByteRange) {
    assertObjectKey(key);
    try {
      const output = await this.clients.internal.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Range: range ? `bytes=${range.start}-${range.end}` : undefined,
        }),
      );
      return output.Body ? { ...output, Body: output.Body } : null;
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }
}
