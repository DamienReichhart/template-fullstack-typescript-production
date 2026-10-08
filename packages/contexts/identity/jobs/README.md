# @template/identity-jobs

Queue consumers of the identity context, run by the worker.

| Queue                  | Job                      | Command                       |
| ---------------------- | ------------------------ | ----------------------------- |
| `identity-maintenance` | `purge-expired-sessions` | `PurgeExpiredSessionsCommand` |
| `identity-maintenance` | `delete-avatar-file`     | `DeleteAvatarFileCommand`     |

Processors extend `TypedProcessor` (`@template/messaging`): payloads are validated against
the contracts in `@template/queue` before any handler runs. The schedule that enqueues
`purge-expired-sessions` lives in `apps/scheduler`; `delete-avatar-file` is enqueued by the
api when an avatar is replaced or removed (`IdentityHousekeeping`).
