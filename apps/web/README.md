# web

Next.js 16 frontend: presentation only. It renders pages and calls the api over HTTP; it holds
no business logic, no Server Actions and no Route Handlers (`bun run check:server-logic`).

## Layout

```
src/
├── proxy.ts             locale prefixing + redirects on the session hint cookie
├── app/                 routes only: each page composes one feature view
│   ├── [locale]/        root layout (lang, providers), (marketing) (auth) (app) groups
│   ├── global-not-found.tsx
│   └── robots.ts · sitemap.ts · manifest.ts · icon.svg
├── i18n/                routing, navigation, request config, page locale
├── features/<name>/     index.ts is the only import surface
│   ├── api/             query keys, queries, mutations (TanStack Query)
│   ├── hooks/           feature behaviour for components
│   ├── components/      feature UI, grouped by role
│   ├── schemas/         form schemas (zod, messages are i18n keys)
│   ├── views/           what a page renders
│   └── lib/             pure helpers
├── shared/              cross-feature: api client, forms, seo, layout, providers, stores
└── styles/globals.css
```

| Feature     | Owns                                                                |
| ----------- | ------------------------------------------------------------------- |
| `auth`      | Login, register, email verification, password reset, session guards |
| `system`    | The "test connection to API" card (public and authenticated pings)  |
| `marketing` | Landing page and its JSON-LD                                        |
| `dashboard` | The authenticated home                                              |

Imports flow `app → features → shared`, never back; a feature never imports another
feature's internals. ESLint enforces it.

## State

| Kind         | Where                                                             |
| ------------ | ----------------------------------------------------------------- |
| Server state | TanStack Query, through `@template/api-client`                    |
| Form state   | react-hook-form + `useZodForm`                                    |
| UI state     | zustand (`shared/stores`), never server data                      |
| Session      | httpOnly cookies set by the api; `tpl_session` is a readable hint |

## Rendering and SEO

The root layout lives under `[locale]`, so the locale is a root param (`next/root-params`):
every page is prerendered per locale, without reading headers. Pages that read the emailed
`?token=` (`verify-email`, `reset-password`) render on demand and are `noindex`. Each page
builds its metadata with `buildMetadata` (canonical, `hreflang` alternates, Open Graph).

## Configuration

`NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` come from the root `.env` and are validated in
`shared/config/public-env.ts`. They are inlined at build time: pass them as build args to the
Docker image.

## Commands

`bunx nx dev web` · `bunx nx build web` · `bunx nx test web`

```sh
docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_SITE_URL=https://www.example.com \
  -t template-web .
```
