# @template/storage

Object storage over the S3 API: RustFS locally (docker compose), any S3-compatible service in
production (AWS S3, Cloudflare R2, MinIO, a RustFS cluster). Why one bucket and direct uploads:
[ADR 0013](../../../docs/adr/0013-files-live-in-one-bucket-and-browsers-upload-directly.md).
How to add a file feature: [`docs/guides/store-files.md`](../../../docs/guides/store-files.md).

## Layout

| Path                | Holds                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| `storage.module.ts` | `StorageModule.forRoot()`: global `ObjectStorage` and `DirectUploads`, clients closed on shutdown |
| `objects/`          | `ObjectStorage` (the port), `S3ObjectStorage` (the adapter), `objectKey()` key builder            |
| `uploads/`          | `DirectUploads`: browser → storage uploads through a staging prefix, verified before being kept   |
| `content/`          | `detectContentType()`: what the first bytes of a file prove it is (PNG, JPEG, GIF, WebP, PDF)     |
| `client/`           | `createS3Clients()`: an `internal` client for requests, a `signer` for URLs given to browsers     |
| `provisioning/`     | `provisionBucket()`: bucket, CORS for the web origins, lifecycle rules; idempotent                |
| `scripts/`          | `provision-storage.ts`, run by `bun run storage:provision` (`--test` for `S3_TEST_BUCKET`)        |
| `testing/`          | `InMemoryObjectStorage` (unit tests), `createStorageTestContext()` (integration), `@…/testing`    |

## Usage

```ts
constructor(private readonly storage: ObjectStorage) {}

await this.storage.put(objectKey('reports', reportId, 'report.pdf'), pdfBytes, {
  contentType: 'application/pdf',
});
const { url } = await this.storage.presignDownload(key, { downloadAs: 'Q3 report.pdf' });
for await (const object of this.storage.listAll('reports/')) { … }
```

`ObjectStorage` covers `put` (buffers or streams of any length, multipart above 5 MiB), `head`,
`read` (whole or a byte range), `stream`, `copy`, `delete`, `deleteMany`, `deletePrefix`,
`list`/`listAll`, `presignDownload`, `presignUpload` and `ping`. Missing objects are `null`,
never errors, and deletes are idempotent.

## Rules

- **Inject `ObjectStorage`, never an `S3Client`.** Contexts reach it through an application port
  implemented in their infrastructure layer, exactly like a repository.
- **Keys are built with `objectKey(context, …)`**: the first segment is the owning context
  (`identity/avatars/<userId>/<uploadId>.webp`). Segments are validated, so user input can never
  escape its prefix. A key is never reused for different content: write a new key, delete the old.
- **`staging/` belongs to `DirectUploads`.** The bucket deletes anything left there after a day.
- **Never trust a declared content type.** `DirectUploads.claim()` checks size, type and file
  signature server-side before a file is kept; a file that fails is deleted.
- **Storage is reported, not required, for readiness**: an outage breaks file features only.

## Configuration

| Variable                                   | Meaning                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `S3_ENDPOINT`                              | S3 API as the servers reach it; empty on AWS                            |
| `S3_PUBLIC_ENDPOINT`                       | S3 API as browsers reach it (presigned URLs); defaults to `S3_ENDPOINT` |
| `S3_REGION`                                | Signing region (`us-east-1` for RustFS and MinIO)                       |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Both or neither; neither means the AWS default credential chain         |
| `S3_FORCE_PATH_STYLE`                      | `true` for RustFS, MinIO and most self-hosted services                  |
| `S3_BUCKET`, `S3_TEST_BUCKET`              | The application's bucket; the one integration suites empty at will      |

## Tests

- `bunx nx test storage`: keys, signatures, presigning and `DirectUploads` over the in-memory fake.
- `bunx nx run storage:test:int`: every operation against the docker compose RustFS
  (provisions `S3_TEST_BUCKET` first).
