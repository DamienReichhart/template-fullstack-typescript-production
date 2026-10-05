# Add a frontend feature

A feature is a slice of the web app around one user goal (`auth`, `system`). It renders and calls
the api; rules stay in the api ([ADR 0006](../adr/0006-the-web-app-is-presentation-only.md)).

1. **Folder** — `apps/web/src/features/<feature>/` with the subfolders it needs: `api/` (query keys,
   `queryOptions`, mutations over `api` from `@/shared/api/api-client`), `hooks/`, `components/`
   grouped by role, `schemas/` (forms), `views/` (what a page renders), `lib/` (pure helpers).
2. **Surface** — `index.ts` exports what routes and other features may use, nothing more. Other
   features import `@/features/<feature>` only; ESLint rejects deeper paths.
3. **Route** — `apps/web/src/app/[locale]/(<group>)/<path>/page.tsx` reads the locale with
   `getPageLocale()`, builds metadata with `buildMetadata(...)`, and renders one view. Add the path
   to `AppRoutes`, to `PROTECTED_ROUTES` or `GUEST_ONLY_ROUTES` if access depends on the session,
   and to `INDEXABLE_ROUTES` if search engines should list it.
4. **Text** — a namespace or keys in `packages/shared/i18n/messages/<locale>/` for every locale;
   attributes (`aria-label`, `alt`, `placeholder`) included.
5. **Forms** — a zod schema whose messages are i18n keys, `useZodForm(schema)`, and the
   `Form`/`FormField` primitives from `@template/ui`; api field errors come back as i18n keys too.
6. **Tests** — specs beside components with `renderWithProviders`; a user journey in
   `apps/web-e2e/src/<feature>/`.

Done when `bunx nx affected -t lint typecheck test` is green and the page renders in every locale.
