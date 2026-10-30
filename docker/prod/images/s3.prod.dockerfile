# syntax=docker/dockerfile:1.7
# Build from the repository root: docker build -f docker/prod/images/s3.prod.dockerfile -t template-s3 .
#
# RustFS (S3 API) on distroless: its musl binary and loader, nothing else. The upstream image's
# entrypoint script only checks the credentials and creates /data, which this image owns already.

ARG RUSTFS_VERSION=1.0.4
ARG GO_VERSION=1.27.3

FROM golang:${GO_VERSION}-alpine AS probe
WORKDIR /src
COPY docker/prod/config/probe/main.go .
RUN CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o /probe main.go

FROM rustfs/rustfs:${RUSTFS_VERSION} AS rustfs
# The upstream image runs as `rustfs`; this build-only stage needs root to stage files.
USER root
# Copy the binary with every library it links (the musl loader only), symlinks resolved.
# Distroless has a merged /usr (/lib links to /usr/lib): libraries move there, still found at /lib.
RUN mkdir -p /rootfs /owned/data \
 && ldd /usr/bin/rustfs | grep -oE '/[^ ]+' | sort -u | xargs tar -chf - /usr/bin/rustfs | tar -xf - -C /rootfs \
 && mkdir -p /rootfs/usr/lib && mv /rootfs/lib/* /rootfs/usr/lib/ && rmdir /rootfs/lib

FROM gcr.io/distroless/static-debian13:nonroot AS runtime
COPY --from=rustfs /rootfs/ /
COPY --from=probe /probe /usr/local/bin/probe
# A named volume mounted here copies this ownership on first use: no chown, no capability.
COPY --from=rustfs --chown=65532:65532 /owned/ /
ENV RUSTFS_VOLUMES=/data \
    RUSTFS_ADDRESS=:9000 \
    RUSTFS_CONSOLE_ENABLE=false \
    RUSTFS_CHECK_UPDATES=false \
    RUSTFS_OBS_LOG_DIRECTORY= \
    RUSTFS_OBS_LOGGER_LEVEL=warn
USER 65532:65532
EXPOSE 9000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD ["probe", "http://127.0.0.1:9000/health"]
ENTRYPOINT ["/usr/bin/rustfs"]
CMD ["server"]
