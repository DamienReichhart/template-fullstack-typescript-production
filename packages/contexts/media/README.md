# Media context

Videos: upload, Transcoding into one Playable file every phone plays, playback.
Vocabulary: [`GLOSSARY.md`](./GLOSSARY.md). Map of all contexts: [`/CONTEXT.md`](../../../CONTEXT.md).

## Layers

| Layer             | Package                          | Depends on                               |
| ----------------- | -------------------------------- | ---------------------------------------- |
| `domain/`         | `@template/media-domain`         | `@template/ddd`                          |
| `application/`    | `@template/media-application`    | domain, `@nestjs/cqrs`                   |
| `infrastructure/` | `@template/media-infrastructure` | application, domain, platform            |
| `http/`           | `@template/media-http`           | application, domain, platform, contracts |
| `jobs/`           | `@template/media-jobs`           | application, platform, queue             |

The dependency rules are enforced by `@nx/enforce-module-boundaries` (`eslint.config.mjs`).

## Where it runs

| Runnable | Uses                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| api      | application + infrastructure + http (endpoints under `/api/v1/videos`)                 |
| worker   | application + infrastructure + jobs (`media` queue: `transcode-video`, through ffmpeg) |

## From upload to playback

1. `POST /videos/uploads` checks the announced file (`VideoFile`: MP4 or MOV, 2 GB at most) and
   answers a presigned form; the browser posts the file straight to the bucket.
2. `POST /videos` checks what arrived (size, type, signature), keeps it as the Source and records
   the Video, `PROCESSING`. `VideoUploaded` enqueues `transcode-video`.
3. The worker downloads the Source to its scratch disk, probes it (`SourceVideo`: a video, ten
   minutes at most), encodes the Playable file, uploads it, marks the Video `READY` and deletes the
   Source. A refused Source fails the Video at once; any other error is retried, and the last
   attempt fails the Video. Either way the Source and the scratch directory are deleted.
4. `GET /videos` and `GET /videos/:videoId` answer a playback URL once `READY`; the web polls
   while a Video is `PROCESSING`.

Why one visually lossless H.264 file and nothing else:
[ADR 0001](./docs/adr/0001-a-video-keeps-one-visually-lossless-h264-file.md). Why the worker
writes to disk: [ADR 0016](../../../docs/adr/0016-the-worker-transcodes-on-scratch-disk.md).

## Integration

Media never calls another context. Its Owner is the caller identity authenticated: the media
http layer reads it with `@CurrentUser()` and requires a verified email with
`@RequireVerifiedEmail()`, both from `@template/http`, enforced by identity's global guards.

## Data

Table `videos` in `packages/platform/database/prisma/schema/media.prisma`. Only this context's
infrastructure layer reads or writes it.

Files live in object storage: the Source under `media/sources/<ownerId>/<videoId>` while the Video
is Processing, the Playable file under `media/videos/<ownerId>/<videoId>` once it is Ready
([guide](../../../docs/guides/store-files.md)).
