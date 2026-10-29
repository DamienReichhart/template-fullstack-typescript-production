# syntax=docker/dockerfile:1.7
# Build from the repository root: docker build -f docker/prod/images/migrator.prod.dockerfile -t template-migrator .
#
# One-shot job run before each release: `prisma migrate deploy`, then the bucket's provisioning
# (docker/prod/config/migrator/migrate.ts). It runs the TypeScript sources: nothing to compile.

ARG BUN_VERSION=1.4.4

FROM oven/bun:${BUN_VERSION}-slim AS base
WORKDIR /repo

# ── Manifests: every workspace package.json, which the lockfile describes ────────
FROM base AS manifests
RUN --mount=type=bind,target=/context \
    cd /context \
 && find . -name package.json -not -path '*/node_modules/*' | tar -cf - -T - | tar -xf - -C /repo \
 && cp bun.lock bunfig.toml /repo/

# ── Dependencies: the Prisma CLI and the storage package's, nothing else ─────────
FROM base AS deps
COPY --from=manifests /repo /repo
# Install scripts run here: Prisma's postinstall fetches the schema engine at build time, so the
# image never downloads anything (or needs write access) when it migrates.
RUN --mount=type=secret,id=ca,required=false \
    --mount=type=cache,target=/root/.bun/install/cache \
    if [ -s /run/secrets/ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca; fi; \
    bun install --frozen-lockfile --filter @template/database --filter @template/storage
COPY packages/platform/database/prisma.config.ts packages/platform/database/
COPY packages/platform/database/prisma packages/platform/database/prisma
COPY packages/platform/config/src packages/platform/config/src
COPY packages/platform/storage/src packages/platform/storage/src
COPY docker/prod/config/migrator/migrate.ts docker/prod/config/migrator/
# Prisma detects the OpenSSL version through a shell, which distroless lacks: without this, it
# guesses another engine and tries to download it. One fixed path for every architecture.
RUN cd node_modules/@prisma/engines && ln -s schema-engine-* schema-engine
# The schema engine links libraries the distroless image lacks (libssl, libgcc_s): copy every
# library it links, from the same Debian release as the runtime: under its linked name, in its
# real /usr directory (merged /usr: /lib and /lib64 are links in the runtime image).
RUN mkdir /engine-libs \
 && for lib in $(ldd node_modules/@prisma/engines/schema-engine | grep -oE '/[^ ]+'); do \
      dir="/engine-libs$(readlink -f "$(dirname "$lib")")"; mkdir -p "$dir" && cp -L "$lib" "$dir/"; \
    done

# ── Runtime ──────────────────────────────────────────────────────────────────────
FROM oven/bun:${BUN_VERSION}-distroless AS runtime
WORKDIR /repo
ENV NODE_ENV=production \
    PRISMA_SCHEMA_ENGINE_BINARY=/repo/node_modules/@prisma/engines/schema-engine
COPY --from=deps /engine-libs/ /
COPY --from=deps /repo /repo
USER 65532:65532
CMD ["--conditions=@template/source", "docker/prod/config/migrator/migrate.ts"]
