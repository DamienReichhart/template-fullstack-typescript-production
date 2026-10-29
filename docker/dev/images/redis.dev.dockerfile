# syntax=docker/dockerfile:1.7
# Development Redis, built by docker-compose.dev.yaml.

ARG REDIS_VERSION=7.4.12

FROM redis:${REDIS_VERSION}-alpine
COPY docker/dev/config/redis/redis.conf /etc/redis/redis.conf
HEALTHCHECK --interval=5s --timeout=5s --start-period=5s --retries=10 \
  CMD ["redis-cli", "-e", "ping"]
CMD ["redis-server", "/etc/redis/redis.conf"]
