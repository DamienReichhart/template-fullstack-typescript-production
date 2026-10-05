# The locale is a root route param

The root layout lives at `app/[locale]/layout.tsx` (no `app/layout.tsx`), so `next/root-params` exposes the locale to every Server Component and next-intl reads it without `headers()`: every page is prerendered once per locale. Unknown locales 404 at the router (`dynamicParams = false`); URLs matching no route render `app/global-not-found.tsx`, behind the experimental `globalNotFound` flag.

## Considered Options

- `setRequestLocale` in every page and layout: deprecated by next-intl, and any component outside a page (a `loading.tsx`, a `not-found.tsx`) silently made the route dynamic.
