# Notifications context

Renders and delivers transactional emails. Vocabulary: [`GLOSSARY.md`](./GLOSSARY.md).
Map of all contexts: [`/GLOSSARY-MAP.md`](../../../GLOSSARY-MAP.md).

## Layers

| Layer             | Package                                  | Depends on                      |
| ----------------- | ---------------------------------------- | ------------------------------- |
| `application/`    | `@template/notifications-application`    | `@template/ddd`, `@nestjs/cqrs` |
| `infrastructure/` | `@template/notifications-infrastructure` | application, platform, i18n     |
| `jobs/`           | `@template/notifications-jobs`           | application, platform, queue    |

No `domain/` and no `http/` layer: nothing to model yet, and nothing is exposed over HTTP.

## Where it runs

Only in the **worker**, which consumes the `mail` queue. The api never sends an email
itself; it enqueues jobs (identity → `@template/queue` → notifications).

## Transports (`MAIL_TRANSPORT`)

| Value     | Use                                                                      |
| --------- | ------------------------------------------------------------------------ |
| `resend`  | Real delivery (default, development included). Requires `RESEND_API_KEY` |
| `console` | Logs emails instead of sending them                                      |
| `capture` | Stores emails in a Redis outbox read by e2e suites (CI)                  |
