# syntax=docker/dockerfile:1.7
# Build from the repository root: docker build -f apps/scheduler/Dockerfile -t template-scheduler .

ARG BUN_VERSION=1.4.2

FROM oven/bun:${BUN_VERSION}-slim AS base
WORKDIR /repo
ENV NX_DAEMON=false \
    NX_NO_CLOUD=true \
    NX_SKIP_NX_CACHE=true

# ── Build: full install, compile the api and every package it depends on ─────────
FROM base AS build
COPY . .
# Optional `ca` secret: extra CA bundle for TLS-intercepting corporate proxies.
#   docker build --secret id=ca,src=/path/to/ca.crt ...
RUN --mount=type=secret,id=ca,required=false \
    if [ -f /run/secrets/ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca; fi; \
    bun install --frozen-lockfile
RUN bunx nx run scheduler:build --output-style=static

# ── Prune: production dependencies and compiled output only ──────────────────────
FROM build AS prune
RUN --mount=type=secret,id=ca,required=false \
    rm -rf apps/web apps/web-e2e apps/api-e2e apps/api apps/worker tools \
 && if [ -f /run/secrets/ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca; fi \
 && bun install --production \
 && find apps packages -type d \( -name src -o -name out-tsc -o -name prisma \) -prune -exec rm -rf {} + \
 && find apps packages \( -name '*.tsbuildinfo' -o -name '*.spec.*' -o -name 'tsconfig*.json' \) -delete

# ── Runtime ──────────────────────────────────────────────────────────────────────
FROM oven/bun:${BUN_VERSION}-slim AS runtime
WORKDIR /repo
ENV NODE_ENV=production \
    LOG_LEVEL=info
COPY --from=prune --chown=bun:bun /repo /repo
USER bun
EXPOSE 4200
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
  CMD bun -e "fetch('http://localhost:' + (process.env.SCHEDULER_HEALTH_PORT ?? 4200) + '/live').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["bun", "apps/scheduler/dist/main.js"]
