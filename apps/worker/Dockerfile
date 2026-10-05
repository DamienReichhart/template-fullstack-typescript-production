# syntax=docker/dockerfile:1.7
# Build from the repository root: docker build -f apps/worker/Dockerfile -t template-worker .

ARG BUN_VERSION=1.4.2

FROM oven/bun:${BUN_VERSION}-slim AS base
WORKDIR /repo
ENV NX_DAEMON=false \
    NX_NO_CLOUD=true \
    NX_SKIP_NX_CACHE=true

# ── Build: full install, compile the worker and every package it depends on ─────────
FROM base AS build
COPY . .
# Optional `ca` secret: extra CA bundle for TLS-intercepting corporate proxies.
#   docker build --secret id=ca,src=/path/to/ca.crt ...
RUN --mount=type=secret,id=ca,required=false \
    if [ -f /run/secrets/ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca; fi; \
    bun install --frozen-lockfile
RUN bunx nx run worker:build --output-style=static

# ── Manifests: every workspace package.json, which the lockfile describes ────────
FROM base AS manifests
RUN --mount=type=bind,from=build,source=/repo,target=/build \
    cd /build \
 && find . -name package.json -not -path '*/node_modules/*' | tar -cf - -T - | tar -xf - -C /repo \
 && cp bun.lock bunfig.toml /repo/

# ── Prune: this app's production dependencies and compiled output, nothing else ──
FROM manifests AS prune
RUN --mount=type=secret,id=ca,required=false \
    if [ -f /run/secrets/ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca; fi; \
    bun install --production --frozen-lockfile --ignore-scripts --filter @template/worker
RUN --mount=type=bind,from=build,source=/repo,target=/build \
    cd /build \
 && find apps/worker packages -type d -name dist -not -path '*/node_modules/*' -prune \
  | tar -cf - --exclude='*.map' --exclude='*.d.ts' --exclude='*.tsbuildinfo' --exclude='*.spec.*' -T - \
  | tar -xf - -C /repo

# ── Runtime ──────────────────────────────────────────────────────────────────────
FROM oven/bun:${BUN_VERSION}-slim AS runtime
WORKDIR /repo
ENV NODE_ENV=production \
    LOG_LEVEL=info
COPY --from=prune --chown=bun:bun /repo /repo
USER bun
EXPOSE 4100
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
  CMD bun -e "fetch('http://localhost:' + (process.env.WORKER_HEALTH_PORT ?? 4100) + '/live').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["bun", "apps/worker/dist/main.js"]
