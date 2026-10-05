# Workspace packages are consumed from source in development

Every package exports a `@template/source` condition pointing at `src/`, enabled by `customConditions` in TypeScript and `--conditions` in Bun, so tests and dev servers run without building dependencies first; production resolves `dist/`. Relative imports therefore name the real `.ts` file (`rewriteRelativeImportExtensions` rewrites them on emit), because Turbopack neither honours custom conditions nor maps `.js` to `.ts`: `apps/web/next.config.ts` turns each `@template/source` export into an alias instead.
