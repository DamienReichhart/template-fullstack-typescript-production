# Conventions

The layout is the documentation: a folder name says what lives in it, and a file name says what
it exports. `bun run check:structure` (pre-commit and CI) enforces the rules marked ✔; the rest
are kept by review.

## Repository

```
apps/                  runnables: api, worker, scheduler, web, and one *-e2e suite per tested app
packages/
├── shared/            imported by browser and server: contracts (routes, schemas, error codes), i18n
├── frontend/          browser only: ui (design system), api-client
├── platform/          technical building blocks, no business rules: config, logger, database, redis,
│                      storage, queue, messaging, http, health, ddd, testing
└── contexts/<context>/<layer>/   business rules, one package per layer (see boundaries.md)
docker/<env>/          dev and prod: images/<service>.<env>.dockerfile, config/<service>/ (its config files)
docs/                  adr/ (system-wide decisions), architecture/, guides/, agents/
tools/scripts/         repository checks, image smoke tests, the agent skills sync
.claude/skills/        agent skills vendored from mattpocock/skills (bun run skills:sync)
```

## Nest runnables (`apps/api`, `apps/worker`, `apps/scheduler`)

- ✔ `src/` holds only `main.ts`, the root module, `modules/` and `scripts/`.
- ✔ Every `modules/<name>/` has `<name>.module.ts`. One module per concern: infrastructure
  (`config`, `database`, …) or a context (`identity`), which imports that context's layers.
- A module owns its folders when it has code of its own: `controllers/`, `dto/`, `services/`,
  `middleware/`, `schedules/`.

## Bounded contexts (`packages/contexts/<context>/`)

- ✔ `README.md` (layers, where it runs, integration, data) and `GLOSSARY.md` at the context root,
  plus `docs/adr/` once a context-specific decision exists.
- ✔ Layer folders are named `domain`, `application`, `infrastructure`, `http`, `jobs`; each
  Nest layer exports `<context>-<layer>.module.ts` and an `index.ts`.

| Layer            | Folders                                                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `domain`         | ✔ `aggregates/<aggregate>/` with `<aggregate>.aggregate.ts`, `errors/`, `events/`, `value-objects/`, `repositories/`; `services/` for logic spanning aggregates                                                                            |
| `application`    | ✔ `commands/<name>/` and `queries/<name>/`, each `<name>.command.ts` (or `.query.ts`), `<name>.handler.ts`, `<name>.handler.spec.ts`; `event-handlers/<event>/`, `ports/<area>/`, `services/`, `views/`, `testing/` (fakes and a test kit) |
| `infrastructure` | `config/`, `persistence/` (`repositories/`, `mappers/`), one folder per adapter area (`security/`, `messaging/`, `mailers/`, `storage/`)                                                                                                   |
| `http`           | `controllers/`, `dto/` (`requests/`, `responses/`), `guards/`, `decorators/`, `errors/`, `testing/`                                                                                                                                        |
| `jobs`           | `processors/`                                                                                                                                                                                                                              |

## Platform, contracts and queues

- ✔ A `type:infra` platform package exposes `src/<package>.module.ts`.
- ✔ Each queue is `queue/src/queues/<queue>/` with `<queue>.queue.ts` and `<queue>.jobs.ts`.
- ✔ Contract folders are named after a context or an api module, each with `index.ts` and
  `<area>.routes.ts`; `common/` holds what every area shares.
- ✔ The api client has one `<contract-area>.endpoints.ts` per contract folder.
- ✔ Every locale under `i18n/messages/` has the same namespace files.

## Web (`apps/web/src`)

`app/` routes, `features/<feature>/`, `shared/`, `i18n/`, `styles/`; see
[`apps/web/README.md`](../../apps/web/README.md). ✔ Every feature has an `index.ts`, its only
import surface.

## Tests

| Kind        | File                                  | Runs with                 | Needs                            |
| ----------- | ------------------------------------- | ------------------------- | -------------------------------- |
| Unit        | `*.spec.ts(x)` beside the code        | `nx test <project>`       | nothing                          |
| Integration | `*.int-spec.ts` beside the code       | ✔ `nx test:int <project>` | `bun run docker:up`              |
| End-to-end  | `apps/*-e2e/src/<area>/*.e2e-spec.ts` | `nx e2e <suite>`          | docker; servers start themselves |

✔ E2E folders mirror what they test: api modules for `api-e2e`, web features for `web-e2e`,
plus `support/`.

## Object keys

`<context>/<area>/<owner id>/<file id>` (`identity/avatars/<userId>/<uploadId>`), built with
`objectKey()`. The first segment is the owning context; `staging/` belongs to `DirectUploads`. A key
is written once: new content gets a new key, the old one is deleted by a job.

## Naming

- Files are kebab-case and end with their role: `.aggregate.ts`, `.command.ts`, `.handler.ts`,
  `.controller.ts`, `.module.ts`, `.processor.ts`, `.mapper.ts`, `.repository.ts`, `.schema.ts`.
- Classes are named after the file: `register-user.handler.ts` exports `RegisterUserHandler`.
- Domain words come from the context's `GLOSSARY.md`, in code as in prose.
