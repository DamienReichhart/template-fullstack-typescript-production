# Identity context

Registration, sign-in, sessions, email verification, password reset and avatars.
Vocabulary: [`GLOSSARY.md`](./GLOSSARY.md). Map of all contexts: [`/CONTEXT.md`](../../../CONTEXT.md).

## Layers

| Layer             | Package                             | Depends on                               |
| ----------------- | ----------------------------------- | ---------------------------------------- |
| `domain/`         | `@template/identity-domain`         | `@template/ddd`                          |
| `application/`    | `@template/identity-application`    | domain, `@nestjs/cqrs`                   |
| `infrastructure/` | `@template/identity-infrastructure` | application, domain, platform            |
| `http/`           | `@template/identity-http`           | application, domain, platform, contracts |
| `jobs/`           | `@template/identity-jobs`           | application, platform, queue             |

The dependency rules are enforced by `@nx/enforce-module-boundaries` (`eslint.config.mjs`).

## Where it runs

| Runnable  | Uses                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------ |
| api       | application + infrastructure + http (endpoints under `/api/v1/auth`, `/api/v1/me`)               |
| worker    | application + infrastructure + jobs (`identity-maintenance` queue: purges, avatar file deletion) |
| scheduler | schedules `purge-expired-sessions` nightly                                                       |

## Integration

Identity never calls another context. Emails are requested by enqueuing jobs defined in
`@template/queue` (`mail` queue); the notifications context consumes them.

## Data

Tables `users`, `sessions`, `one_time_tokens` in
`packages/platform/database/prisma/schema/identity.prisma`. Only this context's
infrastructure layer reads or writes them.

Avatar files live in object storage under `identity/avatars/<userId>/<uploadId>`; `users.avatar_key`
points to the current one. Uploads go from the browser to the bucket and are checked before being
kept; a replaced file is deleted by the `delete-avatar-file` job
([guide](../../../docs/guides/store-files.md)).
