# syntax=docker/dockerfile:1.7
# Build from the repository root: docker build -f docker/prod/images/worker.prod.dockerfile -t template-worker .

ARG BUN_VERSION=1.4.4
ARG FFMPEG_VERSION=9.0.2-1

# ── ffmpeg: static binaries built with libx264 and zimg, for video transcoding ────
FROM mwader/static-ffmpeg:${FFMPEG_VERSION} AS ffmpeg

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
    --mount=type=cache,target=/root/.bun/install/cache \
    if [ -s /run/secrets/ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca; fi; \
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
    --mount=type=cache,target=/root/.bun/install/cache \
    if [ -s /run/secrets/ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca; fi; \
    bun install --production --frozen-lockfile --ignore-scripts --filter @template/worker
RUN --mount=type=bind,from=build,source=/repo,target=/build \
    cd /build \
 && find apps/worker packages -type d -name dist -not -path '*/node_modules/*' -prune \
  | tar -cf - --exclude='*.map' --exclude='*.d.ts' --exclude='*.tsbuildinfo' --exclude='*.spec.*' -T - \
  | tar -xf - -C /repo
# Native addons (argon2, msgpackr) link libraries the distroless runtime lacks, such as libgcc_s:
# copy every library they link, from the same Debian release as the runtime, under its linked
# name, in its real /usr directory (merged /usr: /lib and /lib64 are links in the runtime image).
RUN mkdir /native-libs \
 && for lib in $(find node_modules -name '*.node' -exec ldd {} \; 2>/dev/null | grep -oE '/[^ ]+' | sort -u); do \
      dir="/native-libs$(readlink -f "$(dirname "$lib")")"; mkdir -p "$dir" && cp -L "$lib" "$dir/"; \
    done
# Where transcodes write (MEDIA_SCRATCH_DIR): mounted as a volume, owned by the app user.
RUN mkdir /scratch

# ── Runtime: distroless (no shell, no package manager), Bun as the entrypoint ─────
# Files stay owned by root: the app user reads its code and can change none of it.
FROM oven/bun:${BUN_VERSION}-distroless AS runtime
WORKDIR /repo
ENV NODE_ENV=production \
    LOG_LEVEL=info
COPY --from=prune /native-libs/ /
COPY --from=prune /repo /repo
COPY --from=ffmpeg /ffmpeg /ffprobe /usr/local/bin/
COPY --from=prune --chown=65532:65532 /scratch /scratch
ENV MEDIA_SCRATCH_DIR=/scratch
USER 65532:65532
EXPOSE 4100
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
  CMD ["bun", "-e", "fetch('http://127.0.0.1:' + (process.env.WORKER_HEALTH_PORT ?? 4100) + '/live').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["apps/worker/dist/main.js"]
