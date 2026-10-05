# @template/notifications-infrastructure

Adapters of the notifications ports.

| Path                                     | Holds                                                                                                     |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `notifications-infrastructure.module.ts` | `NotificationsInfrastructureModule.forRoot()`                                                             |
| `config/`                                | `notificationsConfig`: `MAIL_TRANSPORT`, `RESEND_API_KEY`, `MAIL_FROM`, `WEB_APP_URL`                     |
| `mailers/<transport>/`                   | One folder per interchangeable `Mailer`: `resend/`, `console/`, `capture/`; `mailer.factory.ts` picks one |
| `rendering/`                             | `ReactEmailRenderer` and the template catalog                                                             |
| `templates/`                             | React Email `layouts/`, `components/`, `emails/` (one file per email)                                     |
| `links/`                                 | `UrlWebLinks`: absolute links into the web app                                                            |
| `testing/`                               | Outbox reader for e2e suites: `@template/notifications-infrastructure/testing`                            |

## Adding an email

1. Add the kind to `EmailTemplate` (application) and a command + handler.
2. Add `templates/emails/<name>.email.tsx` and its case in `rendering/email-catalog.tsx`.
3. Add its strings to `emails.json` in **every** locale of `@template/i18n`.
