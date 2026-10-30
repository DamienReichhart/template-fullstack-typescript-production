# syntax=docker/dockerfile:1.7
# Build from the repository root: docker build -f docker/prod/images/database.prod.dockerfile -t template-database .
#
# Not distroless, deliberately: `initdb` starts `postgres --boot` through popen(), which needs
# /bin/sh, so a shell-less image cannot initialise an empty volume. The official image runs
# hardened instead: as `postgres` from the first instruction (no gosu, no capability), read-only
# root filesystem and every capability dropped (docker-compose.prod.yaml).

ARG POSTGRES_VERSION=17.11

FROM postgres:${POSTGRES_VERSION}-alpine
COPY docker/prod/config/database/postgresql.conf /etc/postgresql/postgresql.conf
COPY docker/prod/config/database/pg_hba.conf /etc/postgresql/pg_hba.conf
USER postgres
HEALTHCHECK --interval=5s --timeout=5s --start-period=30s --retries=10 \
  CMD ["pg_isready", "--host=127.0.0.1", "--port=5432"]
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
