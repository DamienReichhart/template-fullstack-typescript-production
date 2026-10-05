# @template/contracts

The single source of truth for everything that crosses the HTTP boundary: request and
response schemas (Zod), route segments, cookie and header names, and error codes.

- The **API** validates requests and generates its OpenAPI document from these schemas.
- The **web app** validates forms with the same schemas and builds URLs from the same routes.

## Layout

| Folder    | Holds                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------ |
| `common/` | Building blocks used by every area: email/password schemas, RFC 9457 problem details, cookie and header names            |
| `<area>/` | One folder per bounded context or API module: `<area>.routes.ts`, `requests/`, `responses/`, optional `<area>.errors.ts` |

Folder names mirror `packages/contexts/*` and `apps/api/src/modules/*` (checked by `bun run check:structure`).

## Rules

- Validation messages are **translation keys** (`validation.password.tooShort`), never prose.
- Import from a subpath (`@template/contracts/identity`) to keep bundles small.
- Allowed dependencies: `zod` and `@template/i18n` (supported locales). Tagged `scope:shared`.
