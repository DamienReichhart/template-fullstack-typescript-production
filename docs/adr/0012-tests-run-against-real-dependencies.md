# Tests above unit level run against real dependencies

Repository and adapter tests (`*.int-spec.ts`) run against the docker compose Postgres and Redis, serially; end-to-end suites drive the real api, worker and web, reading emails from the capture outbox. Rate limits stay on in those suites: tests reset the Redis counters between cases instead, so the code path that protects production is the one under test.
