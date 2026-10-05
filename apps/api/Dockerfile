# syntax=docker/dockerfile:1.7
# Build from the repository root: docker build -f apps/api/Dockerfile -t template-api .
# Migrations image:                docker build -f apps/api/Dockerfile --target migrator -t template-migrator .

ARG BUN_VERSION=1.4.2

FROM oven/bun:${BUN_VERSION}-slim AS base
WORKDIR /repo
ENV NX_DAEMON=false \
    NX_NO_CLOUD=true \
    NX_SKIP_NX_CACHE=true

# ── Build: full install, compile the api and every package it depends on ─────────
FROM base AS build
COPY . .
RUN bun install --frozen-lockfile
RUN bunx nx run api:build --output-style=static

# ── Migrations: one-shot job run before each deploy ──────────────────────────────
FROM build AS migrator
WORKDIR /repo/packages/platform/database
CMD ["bunx", "prisma", "migrate", "deploy"]

# ── Prune: production dependencies and compiled output only ──────────────────────
FROM build AS prune
RUN rm -rf apps/web apps/web-e2e apps/api-e2e apps/worker apps/scheduler tools \
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
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
  CMD bun -e "fetch('http://localhost:' + (process.env.API_PORT ?? 4000) + '/health/live').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["bun", "apps/api/dist/main.js"]
