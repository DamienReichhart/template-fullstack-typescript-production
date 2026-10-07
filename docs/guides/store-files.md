# Store files

Files live in object storage, never in Postgres or on a container's disk
([ADR 0013](../adr/0013-files-live-in-one-bucket-and-browsers-upload-directly.md)). The toolkit is
`@template/storage` ([README](../../packages/platform/storage/README.md)); the reference
implementation is the identity context's avatar: read it next to this guide.

## Run it locally

```sh
bun run docker:up            # RustFS: S3 API on :9000, console on :9001 (keys from .env)
bun run storage:provision    # bucket, CORS for CORS_ORIGINS, lifecycle rules; idempotent
```

`bunx nx run storage:test:int` provisions `S3_TEST_BUCKET` itself. The console
(http://localhost:9001/rustfs/console/, `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`) shows every object.

## A context stores files

1. **Port** — in the context's `application/src/ports/storage/`, an abstract class named after the
   domain (`AvatarStorage`, `InvoiceArchive`), with methods in domain words: `keep`, `urlOf`,
   `delete`. Never `ObjectStorage` in the application layer: it does not import platform.
2. **Rules** — what a file may be (types, size) is a domain rule: a value object
   (`AvatarImage.create(contentType, size)`) that throws a domain error. Mirror the limits in
   `@template/contracts` when the web app checks files before sending them, with a spec keeping
   both in step.
3. **Adapter** — in `infrastructure/src/storage/`, implement the port over `ObjectStorage` (and
   `DirectUploads` for browser uploads). Build keys with `objectKey('<context>', '<area>', …)`;
   translate `UploadNotFoundError` and `UploadRejectedError` into the context's domain errors. Bind
   it in the infrastructure module; the app must import `StorageModule` and validate
   `storageConfig`.
4. **Reference** — the aggregate stores the key (a nullable column), never a URL: URLs expire.
   Resolve URLs when building views (`CurrentUserViews`).
5. **Tests** — the in-memory `InMemoryObjectStorage` (`@template/storage/testing`) for adapter
   specs, a fake of your port in the application test kit, and an `*.int-spec.ts` against RustFS
   with `createStorageTestContext()`; add `{ "projects": ["storage"], "target": "provision-test" }`
   to the project's `test:int` `dependsOn`, next to the default `prisma-deploy-test`.

## Browser uploads

Files never transit through the api. The flow, with the avatar's endpoints:

| Step | Who → whom        | Call                                                                            |
| ---- | ----------------- | ------------------------------------------------------------------------------- |
| 1    | browser → api     | `POST /me/avatar/uploads { contentType, size }` → `{ uploadId, url, fields }`   |
| 2    | browser → storage | `uploadToStorage(ticket, file)` (`@template/api-client`): form POST, no cookies |
| 3    | browser → api     | `PUT /me/avatar { uploadId }`: `DirectUploads.claim()` checks, then keeps       |

- `issue()` signs a form for one key under `staging/<scope>/<uploadId>`, one content type and the
  exact announced size: the storage refuses anything else (`400`) before a byte is stored.
- `claim()` rebuilds the staging key from the **authenticated** caller's scope, so nobody can
  claim another user's upload; it re-checks size and type, compares the file signature with the
  declared type, copies the file to its final key and deletes the staged copy. A refused file is
  deleted.
- Require a verified email (or stronger) to issue tickets, and rate limit the endpoint: a ticket
  is write access to your bucket.

## Server-side files

Generated files (exports, invoices, thumbnails) are written by the worker: inject your port, call
`ObjectStorage.put(key, body, { contentType })` in its adapter. Bodies may be strings, bytes,
blobs or streams of unknown length (multipart above 5 MiB). Give downloads a name with
`presignDownload(key, { downloadAs: 'invoice-42.pdf' })`.

## Deleting files

A replaced or removed file is deleted by a job, not in the request: record its key in the domain
event, enqueue a job from an event handler (`DeleteReplacedAvatarFileHandler` →
`delete-avatar-file`), let the worker retry until the storage answers. Deleting a missing object
succeeds, so retries are safe.

## Production

| Concern     | Do                                                                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Bucket      | Private. Created and configured once per environment by `bun run storage:provision` with admin credentials, or by your infrastructure code reproducing what it does.                                   |
| CORS        | The web origins (`CORS_ORIGINS`) may `GET`, `HEAD` and `POST`: provisioning sets it.                                                                                                                   |
| Lifecycle   | `staging/` expires after 1 day; incomplete multipart uploads are aborted after 1 day. Provisioning keeps lifecycle rules it does not own.                                                              |
| Credentials | The app's key may only `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` on `arn:aws:s3:::<bucket>/*` and `s3:ListBucket` on the bucket. Leave both keys empty on AWS to use the instance or pod role. |
| Endpoints   | `S3_ENDPOINT` is what the servers reach (a private address is fine); `S3_PUBLIC_ENDPOINT` is what browsers reach, over HTTPS. Presigned URLs are signed for the latter.                                |
| RustFS      | Run a cluster (erasure coding, several drives) with non-default root credentials and a scoped user for the app; set `RUSTFS_SERVER_DOMAINS` to use virtual-hosted URLs.                                |
| Health      | Storage is _reported_ by `/health/ready` and the system ping, never _required_: its outage degrades file features only. Alert on the ping's `storage: down`.                                           |

## Not built in

- **Image processing.** Avatars are kept as uploaded (EXIF metadata included). Strip metadata
  and resize in a worker job between claim and use when pictures come from cameras.
- **Malware scanning.** For documents other users download, scan in a worker job before the
  object is referenced, or serve them with `downloadAs` only.
- **A CDN.** Presigned URLs are per-object and private; public assets behind a CDN deserve their
  own bucket and a public URL builder.

Done when the adapter's spec and integration spec pass, the e2e journey covers upload and
display, and `bunx nx affected -t lint typecheck test` is green.
