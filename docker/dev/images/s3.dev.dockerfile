# syntax=docker/dockerfile:1.7
# Development object storage (RustFS, S3 API), built by docker-compose.dev.yaml. Buckets, CORS
# and lifecycle rules are not created here: the migrator provisions them from the app's config.

ARG RUSTFS_VERSION=1.0.1

FROM rustfs/rustfs:${RUSTFS_VERSION}
# The web console at /rustfs/console/; no phone-home at boot; logs to stdout like every service.
ENV RUSTFS_CONSOLE_ENABLE=true \
    RUSTFS_CHECK_UPDATES=false \
    RUSTFS_OBS_LOG_DIRECTORY= \
    RUSTFS_OBS_LOGGER_LEVEL=warn
HEALTHCHECK --interval=5s --timeout=5s --start-period=5s --retries=10 \
  CMD ["curl", "-fsS", "http://127.0.0.1:9000/health"]
