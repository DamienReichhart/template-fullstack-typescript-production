# @template/identity-application

The identity use cases, as CQRS commands, queries and event handlers. Depends on the domain
and on **ports** (abstract classes) that `@template/identity-infrastructure` implements.

## Layout

| Path                      | Holds                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------- |
| `commands/<name>/`        | `<name>.command.ts` · `<name>.handler.ts` · `<name>.handler.spec.ts`                                  |
| `queries/<name>/`         | `<name>.query.ts` · `<name>.handler.ts` · `<name>.handler.spec.ts`                                    |
| `event-handlers/<event>/` | Policies reacting to a domain event (e.g. send onboarding emails)                                     |
| `ports/<concern>/`        | What this layer needs from the outside: `security/`, `notifications/`, `configuration/`               |
| `services/`               | Application services shared by several handlers (`SessionIssuer`, `VerificationEmailSender`)          |
| `views/`                  | Read models returned to presentation layers                                                           |
| `testing/`                | In-memory repositories, fakes and `createIdentityTestKit()`: `@template/identity-application/testing` |

## Use cases

| Command / query                  | Effect                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| `RegisterUserCommand`            | Creates the user, opens a session; onboarding emails follow via `UserRegistered`      |
| `VerifyEmailCommand`             | Consumes the token, marks the email verified                                          |
| `ResendEmailVerificationCommand` | Voids old links, sends a new one (silent for unknown/verified emails)                 |
| `LoginCommand`                   | Checks credentials (timing-safe), opens a session                                     |
| `RefreshSessionCommand`          | Rotates the refresh token; reuse revokes, concurrent refresh is tolerated             |
| `LogoutCommand`                  | Revokes the session (idempotent)                                                      |
| `RequestPasswordResetCommand`    | Records `PasswordResetRequested`; the reset email follows (silent for unknown emails) |
| `ResetPasswordCommand`           | Sets the password, revokes every session                                              |
| `PurgeExpiredSessionsCommand`    | Deletes sessions and tokens ended more than 7 days ago                                |
| `GetCurrentUserQuery`            | The signed-in user's view                                                             |

## Wiring

```ts
IdentityApplicationModule.register({ infrastructure: IdentityInfrastructureModule.forRoot() });
```

The infrastructure module is passed in, so this layer never imports it.
