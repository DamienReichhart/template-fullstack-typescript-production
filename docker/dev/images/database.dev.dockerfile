# syntax=docker/dockerfile:1.7
# Development PostgreSQL, built by docker-compose.dev.yaml. The official image's entrypoint runs
# config/database/init/*.sql once, on the first start of an empty volume (the test database).

ARG POSTGRES_VERSION=17.11

FROM postgres:${POSTGRES_VERSION}-alpine
COPY docker/dev/config/database/postgresql.conf /etc/postgresql/postgresql.conf
COPY docker/dev/config/database/init/ /docker-entrypoint-initdb.d/
HEALTHCHECK --interval=5s --timeout=5s --start-period=30s --retries=10 \
  CMD ["pg_isready", "--host=127.0.0.1", "--port=5432"]
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
