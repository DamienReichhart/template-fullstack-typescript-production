import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';
import type { ConfigType, storageConfig } from '@template/config';

export type StorageConfig = ConfigType<typeof storageConfig>;

/**
 * Two clients over the same credentials. `internal` performs every request from the server;
 * `signer` only signs URLs handed to browsers, so they point to `S3_PUBLIC_ENDPOINT`: a
 * presigned URL embeds its host in the signature and cannot be rewritten afterwards.
 */
export interface S3Clients {
  internal: S3Client;
  signer: S3Client;
}

export function createS3Clients(config: StorageConfig): S3Clients {
  const shared: S3ClientConfig = {
    region: config.S3_REGION,
    forcePathStyle: config.S3_FORCE_PATH_STYLE,
    credentials:
      config.S3_ACCESS_KEY_ID && config.S3_SECRET_ACCESS_KEY
        ? {
            accessKeyId: config.S3_ACCESS_KEY_ID,
            secretAccessKey: config.S3_SECRET_ACCESS_KEY,
          }
        : undefined,
    // Checksums only where S3 requires them: several S3-compatible services reject the
    // CRC32 headers the SDK otherwise adds to every upload.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  };
  return {
    internal: new S3Client({
      ...shared,
      endpoint: config.S3_ENDPOINT,
      maxAttempts: 3,
      // A storage outage must fail requests quickly, not hold them until the client gives up.
      requestHandler: { connectionTimeout: 3_000, requestTimeout: 30_000 },
    }),
    signer: new S3Client({
      ...shared,
      endpoint: config.S3_PUBLIC_ENDPOINT ?? config.S3_ENDPOINT,
    }),
  };
}
