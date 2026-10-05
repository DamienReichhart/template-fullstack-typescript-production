# @template/notifications-jobs

Consumers of the `mail` queue, run by the worker.

| Job                         | Command                         |
| --------------------------- | ------------------------------- |
| `send-welcome-email`        | `SendWelcomeEmailCommand`       |
| `send-email-verification`   | `SendEmailVerificationCommand`  |
| `send-password-reset-email` | `SendPasswordResetEmailCommand` |

Every command carries `<job name>:<job id>` as idempotency key, so retries never send twice.
