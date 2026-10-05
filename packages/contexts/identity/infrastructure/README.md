# @template/identity-infrastructure

Adapters for every port of `@template/identity-application`.

| Path                                | Holds                                                                                   |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| `identity-infrastructure.module.ts` | `IdentityInfrastructureModule.forRoot()`: binds all ports                               |
| `config/`                           | `identityConfig` (JWT secret, TTLs) and the `IdentitySettings` binding                  |
| `persistence/repositories/`         | Prisma repositories, joined to the current `UnitOfWork` through `PrismaTransactionHost` |
| `persistence/mappers/`              | Record ⇄ aggregate mapping (reconstitution records no events)                           |
| `security/hashing/`                 | argon2id (OWASP parameters) via `@node-rs/argon2`                                       |
| `security/tokens/`                  | HS256 access tokens (`jose`), 256-bit refresh/one-time tokens stored as SHA-256         |
| `messaging/`                        | `BullMqIdentityNotifier`: enqueues `mail` jobs for the notifications context            |

## Tests

- `bun run test` (via `nx test identity-infrastructure`): adapters in isolation.
- `nx run identity-infrastructure:test:int`: repositories against `DATABASE_TEST_URL`.
