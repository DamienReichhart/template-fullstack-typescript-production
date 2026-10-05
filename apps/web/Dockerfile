# syntax=docker/dockerfile:1.7
# Build from the repository root:
#   docker build -f apps/web/Dockerfile \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
#     --build-arg NEXT_PUBLIC_SITE_URL=https://www.example.com \
#     -t template-web .
#
# `NEXT_PUBLIC_*` values are inlined into the bundle and the prerendered pages at build
# time: one image per environment. The build fails fast when they are missing.

ARG BUN_VERSION=1.4.2

FROM oven/bun:${BUN_VERSION}-slim AS base
WORKDIR /repo
ENV NX_DAEMON=false \
    NX_NO_CLOUD=true \
    NX_SKIP_NX_CACHE=true \
    NEXT_TELEMETRY_DISABLED=1

# ── Build: Next bundles the workspace packages from source ──────────────────────
FROM base AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
COPY . .
# Optional `ca` secret: extra CA bundle for TLS-intercepting corporate proxies.
#   docker build --secret id=ca,src=/path/to/ca.crt ...
RUN --mount=type=secret,id=ca,required=false \
    if [ -f /run/secrets/ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca; fi; \
    bun install --frozen-lockfile
# Through Nx: the workspace packages' declarations are built first, which Next's type check
# reads through project references. The build script pins NODE_ENV=production.
RUN bunx nx run web:build --output-style=static

# ── Runtime: the standalone server traces only the files it needs ───────────────
FROM oven/bun:${BUN_VERSION}-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
# `outputFileTracingRoot` is the monorepo root, so the server lives at apps/web/server.js.
COPY --from=build --chown=bun:bun /repo/apps/web/.next/standalone ./
COPY --from=build --chown=bun:bun /repo/apps/web/.next/static ./apps/web/.next/static
USER bun
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=15s --retries=3 \
  CMD bun -e "fetch('http://localhost:' + (process.env.PORT ?? 3000) + '/robots.txt').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["bun", "apps/web/server.js"]
