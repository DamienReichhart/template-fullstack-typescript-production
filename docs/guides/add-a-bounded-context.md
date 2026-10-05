# Add a bounded context

A new context is a new language before it is new code: agree on its terms first (`/grill-with-docs`),
then create only the layers it needs. Notifications has no `domain` and no `http`.

1. **Language** — `packages/contexts/<context>/GLOSSARY.md` (format: the identity glossary), a line in
   `GLOSSARY-MAP.md` for the context and one per relationship with another context.
2. **Packages** — one per layer, `packages/contexts/<context>/<layer>/`, copied from the identity
   equivalent: `package.json` named `@template/<context>-<layer>` with tags
   `scope:<context>` and `layer:<layer>`, `tsconfig*.json`, `eslint.config.mjs`, `src/index.ts`,
   `src/<context>-<layer>.module.ts`. Run `bun install`, then `bunx nx sync`.
3. **Boundary rule** — add `scope:<context>` to `depConstraints` in `eslint.config.mjs`, allowing
   itself, `scope:platform` and `scope:shared`.
4. **README** — `packages/contexts/<context>/README.md`: layers, where it runs, how it integrates,
   which tables it owns.
5. **Data** — `packages/platform/database/prisma/schema/<context>.prisma`, then
   `bun run db:migrate`. Only this context's `infrastructure` touches these tables
   ([ADR 0009](../adr/0009-one-database-schema-split-by-context.md)).
6. **Compose** — `apps/<app>/src/modules/<context>/<context>.module.ts` in each runnable that uses
   it, wiring `XApplicationModule.register({ infrastructure: XInfrastructureModule.forRoot() })`
   into the http or jobs layer, and import it in the root module.
7. **Contracts** — HTTP-facing contexts get `packages/shared/contracts/src/<context>/` (with
   `<context>.routes.ts`) and `packages/frontend/api-client/src/endpoints/<context>.endpoints.ts`.

Done when `bun run check:structure` and `bunx nx affected -t lint typecheck test` are green.
