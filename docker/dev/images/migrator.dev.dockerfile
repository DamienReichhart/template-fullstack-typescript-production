# syntax=docker/dockerfile:1.7
# Development image of the migrator, built by docker-compose.dev.yaml: a one-shot that migrates the
# database and provisions the bucket, then exits. A migration added under prisma/ rebuilds and
# reruns it (`docker compose watch`).
#
# The stages before the last are the same in every dev app image: built once, shared.

ARG BUN_VERSION=1.4.4

# ── Manifests: every workspace package.json, which the lockfile describes ────────
FROM oven/bun:${BUN_VERSION}-slim AS manifests
WORKDIR /repo
RUN --mount=type=bind,target=/context \
    cd /context \
 && find . -name package.json -not -path '*/node_modules/*' | tar -cf - -T - | tar -xf - -C /repo \
 && cp bun.lock bunfig.toml /repo/

# ── Dependencies: reinstalled only when a manifest or the lockfile changes ────────
FROM oven/bun:${BUN_VERSION}-slim AS deps
WORKDIR /repo
ENV NX_DAEMON=false \
    NX_NO_CLOUD=true \
    NEXT_TELEMETRY_DISABLED=1
RUN chown bun:bun /repo
USER bun
COPY --from=manifests --chown=bun:bun /repo /repo
# Optional `ca` secret: extra CA bundle for TLS-intercepting corporate proxies (BUILD_CA).
# Bun's download cache stays in a build cache mount, out of the image.
RUN --mount=type=secret,id=ca,required=false,mode=0444 \
    --mount=type=cache,target=/home/bun/.bun/install/cache,uid=1000,gid=1000 \
    if [ -s /run/secrets/ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca; fi; \
    bun install --frozen-lockfile
COPY --chown=bun:bun . .
RUN cd packages/platform/database && bunx prisma generate

# ── migrator: the only stage that differs ──────────────────────────────────────────────
FROM deps AS dev
# The same two steps as production (docker/prod/config/migrator/migrate.ts), from source.
CMD ["bun", "--conditions=@template/source", "docker/prod/config/migrator/migrate.ts"]
