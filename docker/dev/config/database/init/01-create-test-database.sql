-- Runs once, on first start of an empty volume.
-- Integration and e2e suites run against this database so `bun run dev` data survives test runs.
CREATE DATABASE template_test;
