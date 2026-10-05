# Bun runs every app, installs every package and runs every test

Bun is the package manager, the runtime of the api, worker, scheduler and web server, and the test runner (`bun test`, no Jest), so one tool covers install, dev, test and production. The price is ESM/CommonJS interop: `nestjs-cls`, `@nestjs/throttler` and `@bull-board/nestjs` break under Bun, so we own their small replacements (`PrismaTransactionHost`, `RateLimitGuard` with `RedisRateLimiter`, `createBullBoardRouter`).

## Consequences

Before adding a Nest integration package, boot the api and run its tests under Bun: an interop failure shows up at startup as "require async module" or as hooks that never resolve.
