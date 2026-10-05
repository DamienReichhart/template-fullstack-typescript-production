# @template/i18n

Translation catalogs shared by the web app (next-intl) and the email templates
(notifications context).

## Layout

| Path                                 | Holds                                                       |
| ------------------------------------ | ----------------------------------------------------------- |
| `messages/<locale>/<namespace>.json` | ICU messages. Every locale has the same namespaces and keys |
| `src/config/`                        | `locales`, `defaultLocale`, `namespaces`, shared `formats`  |
| `src/loaders/load-messages.ts`       | Loads all namespaces of a locale                            |
| `src/types/messages.ts`              | `Messages` type, inferred from the English catalogs         |

## Rules

- English (`en`) is the reference catalog; `messages-parity.spec.ts` fails when another
  locale misses or adds a key.
- Namespaces mirror web features (`auth`, `dashboard`, `marketing`, `system`) plus
  cross-cutting catalogs (`common`, `validation`, `errors`, `emails`, `seo`).
- `validation.*` keys are produced by `@template/contracts` schemas; `errors.*` keys are
  API problem-detail `code`s.
- To add a locale: see `docs/guides/add-a-locale.md`.
