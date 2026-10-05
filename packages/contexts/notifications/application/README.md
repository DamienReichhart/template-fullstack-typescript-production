# @template/notifications-application

What the notifications context does: one command per email. Each handler builds an
`EmailTemplate` (what to say), asks the `EmailRenderer` for localised content and hands the
result to the `Mailer`. Vocabulary: [`../GLOSSARY.md`](../GLOSSARY.md).

| Path               | Holds                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------- |
| `commands/<name>/` | `send-welcome-email`, `send-email-verification`, `send-password-reset-email`            |
| `ports/`           | `Mailer`, `EmailRenderer`, `WebLinks`                                                   |
| `models/`          | `EmailTemplate` (discriminated union), `EmailMessage`                                   |
| `testing/`         | Fakes and `createNotificationsTestKit()`: `@template/notifications-application/testing` |

There is no `domain/` layer yet: sending an email has no invariant worth an aggregate.
Add one when a rule appears (preferences, suppression lists, digests).
