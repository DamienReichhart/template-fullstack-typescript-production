# Bounded contexts are split into one package per layer

Each context under `packages/contexts/<context>/` is up to five packages (`domain`, `application`, `infrastructure`, `http`, `jobs`) rather than folders in one package, so Nx tags (`layer:*`, `scope:*`) make a wrong-direction import a lint error instead of a review comment. Ports are abstract classes in `application`; a runnable composes the layers, passing the infrastructure module into `register({ infrastructure })`, so `application` never imports an adapter.

## Considered Options

- One package per context with folder conventions: cheaper to start, but nothing stops `domain` importing Prisma.
- One package per app: contexts could not be shared between the api and the worker.
