# @template/testing

Test helpers shared by every package. Import it from `*.spec.ts` files only.

| Path        | Holds                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `app/`      | `createTestApp({ controllers, providers, overrides })`: in-process HTTP app wired like production, without Redis or Postgres |
| `fixtures/` | Builders for valid payloads (`aRegistration()`), unique on every call                                                        |

Integration helpers that need a real dependency live with that dependency
(`@template/database/testing`, `@template/notifications-infrastructure/testing`).
