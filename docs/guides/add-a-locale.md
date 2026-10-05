# Add a locale

Example: German (`de`).

1. **Declare it** — add `'de'` to `locales` in `packages/shared/i18n/src/config/locales.ts`.
   Routing, the sitemap, `hreflang` alternates, the contracts' `localeSchema` and the locale
   switcher all read that list.
2. **Translate** — copy `packages/shared/i18n/messages/en/` to `messages/de/` and translate every
   file, emails included. Add `de` under `common.localeSwitcher.locales` in every locale.
   The i18n parity spec fails on a missing key; the structure check on a missing file.
3. **Check** — `bunx nx affected -t test`, then open `/de` and register a user with German selected:
   the verification email arrives in German.

Existing users keep their Preferred language; nothing to migrate.
