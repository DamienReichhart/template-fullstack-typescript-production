# worker

Consumes BullMQ queues (NestJS application context on Bun, no HTTP API). Every job is
validated against its contract (`@template/queue`) and turned into an application command.

## Layout

```
src/
├── main.ts              bootstrap: logger, shutdown hooks
├── worker.module.ts     imports every module below
└── modules/<name>/      <name>.module.ts
```

| Module          | Provides                                                               |
| --------------- | ---------------------------------------------------------------------- |
| `config`        | Validated env, including `WORKER_CONCURRENCY` and `WORKER_HEALTH_PORT` |
| `logger`        | pino, `service=worker`                                                 |
| `database`      | Prisma + `UnitOfWork`                                                  |
| `redis`         | Shared client (probe, capture mail transport)                          |
| `storage`       | Object storage, for jobs that write or delete files                    |
| `messaging`     | BullMQ consumers, concurrency, graceful drain                          |
| `cqrs`          | Command bus the processors dispatch to                                 |
| `health`        | Probe server: `GET :WORKER_HEALTH_PORT/live` and `/ready`              |
| `identity`      | `identity-maintenance` queue (session purge, avatar file deletion)     |
| `media`         | `media` queue: video transcoding with ffmpeg, one at a time            |
| `notifications` | `mail` queue                                                           |

## Scaling

Run as many replicas as needed: BullMQ distributes jobs, and each replica processes up to
`WORKER_CONCURRENCY` jobs per queue, except `media`: one transcode at a time, since an encode
uses every core. On `SIGTERM`, workers stop fetching and finish their active jobs before the
process exits.

Transcoding needs `ffmpeg` and `ffprobe` with libx264 and zimg on the `PATH` (the worker images
ship them; install them to run the worker from source) and a few GB of scratch disk
(`MEDIA_SCRATCH_DIR`, [ADR 0016](../../docs/adr/0016-the-worker-transcodes-on-scratch-disk.md)).

## Commands

`bunx nx dev worker` · `bunx nx build worker` · `docker build -f docker/prod/images/worker.prod.dockerfile -t template-worker .`
