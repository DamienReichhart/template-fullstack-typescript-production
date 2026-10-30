# @template/media-infrastructure

Adapters for every port of `@template/media-application`.

| Path                             | Holds                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| `media-infrastructure.module.ts` | `MediaInfrastructureModule.forRoot()`: binds all ports                                       |
| `config/`                        | `mediaConfig`: `FFMPEG_PATH`, `FFPROBE_PATH`, `MEDIA_SCRATCH_DIR`                            |
| `persistence/`                   | `PrismaVideoRepository` and its mapper                                                       |
| `storage/`                       | `ObjectStorageVideoStorage`: Sources and Playable files, uploads checked by `DirectUploads`  |
| `transcoding/`                   | `FfmpegVideoTranscoder`: probe (`ffprobe-report.ts`), encode (`ffmpeg-arguments.ts`), upload |
| `messaging/`                     | `BullMqVideoTranscoding`: one `transcode-video` job per Video on the `media` queue           |

The worker needs `ffmpeg` and `ffprobe` built with libx264 and zimg (`zscale`): the worker image
ships them; on a development machine install them (`apt install ffmpeg`, `brew install ffmpeg`).

## Tests

- `bun run test` (via `nx test media-infrastructure`): adapters in isolation, the ffmpeg command
  line included.
- `nx run media-infrastructure:test:int`: the repository against `DATABASE_TEST_URL`, the storage
  against the RustFS `S3_TEST_BUCKET`, and a real transcode of an HDR, rotated, geotagged HEVC
  recording with the local ffmpeg.
