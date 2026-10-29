# Run with Docker

Two compose files, one per environment, read the root `.env`
([ADR 0015](../adr/0015-docker-runs-every-service-on-fixed-addresses.md)):

| Service     | Address          | Development                                | Production                               |
| ----------- | ---------------- | ------------------------------------------ | ---------------------------------------- |
| database    | `192.168.250.10` | Postgres 17, `127.0.0.1:5432`, test DB too | Postgres 17, hardened                    |
| redis       | `192.168.250.11` | Redis 7, `127.0.0.1:6379`, no password     | distroless, `REDIS_PASSWORD`             |
| s3          | `192.168.250.12` | RustFS, `127.0.0.1:9000`, console `:9001`  | distroless, no console                   |
| migrator    | `192.168.250.20` | migrations and bucket, then exits          | same, before every release               |
| api         | `192.168.250.30` | Bun watch mode, `127.0.0.1:4000`           | distroless                               |
| worker      | `192.168.250.31` | Bun watch mode, probe `127.0.0.1:4100`     | distroless                               |
| scheduler   | `192.168.250.32` | Bun watch mode, probe `127.0.0.1:4200`     | distroless                               |
| web         | `192.168.250.40` | `next dev`, `127.0.0.1:3000`               | distroless, Next standalone              |
| nginx       | `192.168.250.50` |                                            | routes `api.*`, `s3.*`, else web (:8080) |
| cloudflared | `192.168.250.51` |                                            | Cloudflare Tunnel, outbound only         |

The two stacks use the same subnet: run one at a time on a host.

## Development

```sh
cp .env.example .env
bun run docker:dev     # build, start, then sync your edits into the containers
```

`docker:dev` is `docker compose -f docker-compose.dev.yaml up --build --watch`. Edits under
`apps/` and `packages/` are copied into the containers and Bun or Next reloads; a `bun.lock`
change rebuilds the images, and a change under `packages/platform/database/prisma` rebuilds and
reruns the migrator. `bun run docker:down` stops everything (add `-v` to the command to drop the
data).

`bun run docker:up` starts the database, Redis and RustFS only, for `bun run dev` and the test
suites run on the host. They reach the services at the `.env` addresses, which works on Linux; on
Docker Desktop (macOS, Windows) the bridge is not reachable from the host, so override the
server-side URLs with the published ports, e.g.
`DATABASE_URL=postgresql://template:template@localhost:5432/template`.

Behind a TLS-intercepting proxy, give the image builds its CA (PEM):
`export BUILD_CA="$(cat corporate-ca.crt)"`.

## Production

One host, no published port: Cloudflare reaches nginx through the tunnel cloudflared opens.

1. **Tunnel** — in Cloudflare Zero Trust, create a tunnel and copy its token. Add a public
   hostname for `example.com`, `api.example.com` and `s3.example.com`, each pointing at
   `http://192.168.250.50:8080` (nginx).
2. **`.env`** — start from `.env.example` and change what its `# prod:` notes say:

   | Keys                                                  | Production value                                                  |
   | ----------------------------------------------------- | ----------------------------------------------------------------- |
   | `LOG_LEVEL`                                           | `info`                                                            |
   | `POSTGRES_PASSWORD`, `DATABASE_URL`                   | a long random password, in both                                   |
   | `REDIS_PASSWORD`, `REDIS_URL`                         | a long random password; `redis://:<password>@192.168.250.11:6379` |
   | `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`            | long random values (RustFS root credentials)                      |
   | `S3_PUBLIC_ENDPOINT`                                  | `https://s3.example.com`                                          |
   | `API_PUBLIC_URL`, `NEXT_PUBLIC_API_URL`               | `https://api.example.com`                                         |
   | `WEB_APP_URL`, `NEXT_PUBLIC_SITE_URL`, `CORS_ORIGINS` | `https://example.com`                                             |
   | `COOKIE_DOMAIN`                                       | `example.com`                                                     |
   | `SWAGGER_ENABLED`                                     | `false`                                                           |
   | `JWT_ACCESS_SECRET`, `RESEND_API_KEY`, `MAIL_FROM`    | real values                                                       |
   | `CLOUDFLARE_TUNNEL_TOKEN`                             | the tunnel's token                                                |
   | `IMAGE_TAG`                                           | the release to run, e.g. `1.4.0`                                  |

   `NODE_ENV`, `TRUST_PROXY` and `COOKIE_SECURE` are fixed by `docker-compose.prod.yaml`.

3. **Images** — pull a release (the Release workflow publishes every service to GHCR), or build
   them on the host; the web image inlines `NEXT_PUBLIC_*`, so build it for these URLs:

   ```sh
   docker compose -f docker-compose.prod.yaml pull     # or: build
   ```

4. **Start** — the migrator applies the migrations and provisions the bucket, then the apps,
   nginx and cloudflared start, each once its dependencies are healthy:

   ```sh
   docker compose -f docker-compose.prod.yaml up -d --wait
   ```

A release is steps 3 and 4 again with the new `IMAGE_TAG` (see
[cut a release](./cut-a-release.md)).

### What each container may do

Every container runs as a non-root user with a read-only root filesystem, every Linux capability
dropped and `no-new-privileges`; they write only to their volume and a `/tmp` tmpfs. Postgres
admits only the migrator, api and worker addresses (`pg_hba.conf`); Redis wants a password and
refuses `FLUSHALL`, `FLUSHDB` and `DEBUG`. nginx trusts `CF-Connecting-IP` from cloudflared alone
and sends the api a single `X-Forwarded-For`, so a visitor cannot pick the address its rate
limit counts against. Logs go to Docker, rotated at 5 × 10 MB per container.

Sizing is the host's: `docker/prod/config/database/postgresql.conf` assumes about 1 GB for
Postgres, and no container has a memory limit. Backups are yours too: the `database-data`,
`redis-data` and `s3-data` volumes hold everything.

### Check a change

`bun tools/scripts/smoke-test-stack.ts` builds every production image, boots the stack (all but
cloudflared) and asks nginx for each route by Host header. CI runs it when the Docker setup
changes. It needs a Linux host.
