# syntax=docker/dockerfile:1.7
# Build from the repository root: docker build -f docker/prod/images/redis.prod.dockerfile -t template-redis .
#
# Redis on distroless: redis-server, redis-cli (the healthcheck) and the musl libraries they link.
# The password is not in the image: docker-compose.prod.yaml passes `--requirepass`.

ARG REDIS_VERSION=7.4.12

FROM redis:${REDIS_VERSION}-alpine AS redis
# Copy the binaries with every library they link, symlinks resolved.
# Distroless has a merged /usr (/lib links to /usr/lib): libraries move there, still found at /lib.
RUN mkdir -p /rootfs /owned/data \
 && { ldd /usr/local/bin/redis-server; ldd /usr/local/bin/redis-cli; } | grep -oE '/[^ ]+' | sort -u \
  | xargs tar -chf - /usr/local/bin/redis-server /usr/local/bin/redis-cli | tar -xf - -C /rootfs \
 && mkdir -p /rootfs/usr/lib && mv /rootfs/lib/* /rootfs/usr/lib/ && rmdir /rootfs/lib

FROM gcr.io/distroless/static-debian13:nonroot AS runtime
COPY --from=redis /rootfs/ /
COPY docker/prod/config/redis/redis.conf /etc/redis/redis.conf
# A named volume mounted here copies this ownership on first use: no chown, no capability.
COPY --from=redis --chown=65532:65532 /owned/ /
USER 65532:65532
EXPOSE 6379
# REDISCLI_AUTH carries the password (set in docker-compose.prod.yaml); -e fails on NOAUTH.
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
  CMD ["redis-cli", "-e", "ping"]
ENTRYPOINT ["/usr/local/bin/redis-server"]
CMD ["/etc/redis/redis.conf"]
