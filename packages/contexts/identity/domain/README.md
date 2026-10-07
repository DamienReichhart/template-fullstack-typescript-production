# @template/identity-domain

The identity model: who can sign in, how, and from where. Pure TypeScript, depends only on
`@template/ddd`. Vocabulary: [`../GLOSSARY.md`](../GLOSSARY.md).

## Aggregates

| Aggregate      | Invariants it protects                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `User`         | Normalised unique email, hashed password, idempotent email verification, one Avatar at a time (its replacement names the previous file) |
| `Session`      | Refresh-token rotation; replaying a rotated token revokes the session                                                                   |
| `OneTimeToken` | Single use, purpose-bound, expires                                                                                                      |

Each aggregate folder holds `<name>.aggregate.ts`, `value-objects/`, `events/`, `errors/`
and `repositories/` (ports implemented by `@template/identity-infrastructure`).
