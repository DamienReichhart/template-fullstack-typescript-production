# CLAUDE.md

Nx + Bun monorepo: a NestJS api, a BullMQ worker and scheduler, a Next.js web app. Business rules live in bounded contexts under `packages/contexts/`; apps only compose them.

## Before you change code

- Name things with the glossary: `CONTEXT.md` leads to each context's `GLOSSARY.md`.
- Adding a context, command, query, job, schedule, web feature, locale or file storage: follow its recipe in `docs/guides/`.
- Adding a project or a folder an app or context does not have yet: `docs/architecture/conventions.md` (`bun run check:structure` enforces it).
- An import the boundary rule rejects is a design signal, not a lint nuisance: `docs/architecture/boundaries.md`.

## Gotchas

- Relative imports name the real file: `./user.aggregate.ts`, never `.js` or extensionless (ADR 0003).
- Packages run from source in tests and dev (`@template/source` condition): no build step between editing a package and testing its consumer.
- Nest integration packages can break under Bun (ADR 0001): boot the app and run its tests before keeping one.
- The web app calls the api; it never holds logic, Server Actions or Route Handlers (ADR 0006). Every user-facing string, attributes included, goes through next-intl in every locale under `packages/shared/i18n/messages/`.
- `*.int-spec.ts` and the e2e suites need `bun run docker:up`; e2e suites start the api, worker and web themselves unless they already run. The dev bucket needs `bun run storage:provision` once.
- Files go to object storage through a context port over `ObjectStorage` (`@template/storage`), never to Postgres or disk; browsers upload with presigned forms, never through the api (ADR 0013).

## Done means

`bunx nx affected -t lint typecheck test` green, then the integration or e2e suite of what you touched. Commits are Conventional Commits, one concern each.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage labels, unchanged. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: `CONTEXT.md` at the root (`GLOSSARY-MAP.md` is a symlink to it), one `GLOSSARY.md` per context. See `docs/agents/domain.md`.
