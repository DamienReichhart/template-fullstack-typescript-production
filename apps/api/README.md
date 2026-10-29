# api

The HTTP API (NestJS on Bun). A composition root and nothing else: every capability comes
from a module in `src/modules/`, which wires platform packages and bounded contexts.

## Layout

```
src/
├── main.ts            bootstrap: logger, http setup, listen
├── app.module.ts      imports every module below, in dependency order
├── modules/<name>/    <name>.module.ts (+ app-specific code for app features)
└── scripts/           build-time scripts (OpenAPI generation)
```

| Module      | Provides                                                                   |
| ----------- | -------------------------------------------------------------------------- |
| `config`    | Validated env: app, http, database, redis, storage, identity, cookies      |
| `logger`    | pino, `service=api`                                                        |
| `database`  | Prisma + `UnitOfWork`                                                      |
| `redis`     | Shared Redis client (rate limiting)                                        |
| `storage`   | Object storage (`ObjectStorage`, `DirectUploads`), reported in health      |
| `messaging` | BullMQ connection and `JobProducer` (produce only)                         |
| `cqrs`      | Command, query and event buses                                             |
| `http`      | RFC 9457 errors, Zod validation, rate limiting                             |
| `health`    | `/health/live`, `/health/ready`                                            |
| `identity`  | `/api/v1/auth/*`, `/api/v1/me` (avatar included), auth guards              |
| `system`    | `/api/v1/system/ping` (public, storage included) and `/ping/authenticated` |
| `admin`     | Bull Board at `/admin/queues` (ADMIN only)                                 |

## Commands

| Command                   | Does                                                   |
| ------------------------- | ------------------------------------------------------ |
| `bunx nx dev api`         | Runs from sources with watch mode (no build needed)    |
| `bunx nx build api`       | Compiles the api and its packages to `dist/`           |
| `bunx nx test api`        | Unit tests                                             |
| `bunx nx run api:openapi` | Regenerates `openapi.json` (CI fails when it is stale) |

Swagger UI: `http://localhost:4000/docs` when `SWAGGER_ENABLED=true`.

## Docker

```bash
docker build -f docker/prod/images/api.prod.dockerfile -t template-api .            # runtime image
docker build -f docker/prod/images/migrator.prod.dockerfile -t template-migrator .  # migrations, bucket
```

Both compose files run it too: [`docs/guides/run-with-docker.md`](../../docs/guides/run-with-docker.md).
