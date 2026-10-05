# @template/ddd

Tactical DDD building blocks shared by every bounded context. Pure TypeScript: no Nest, no
database, no I/O. The only package a `layer:domain` library may depend on.

## Layout

| Folder             | Holds                                                           |
| ------------------ | --------------------------------------------------------------- |
| `building-blocks/` | `AggregateRoot`, `Entity`, `ValueObject`, `Identifier` (UUIDv7) |
| `events/`          | `DomainEvent` base class                                        |
| `errors/`          | `DomainError` base class                                        |
| `time/`            | `Clock` port, `SystemClock`, `FixedClock` (tests)               |
| `application/`     | `UnitOfWork` port and its pass-through implementation           |

## Rules

- Aggregates mutate state only through methods and record `DomainEvent`s; the application
  layer pulls and publishes them after persistence.
- `Clock` and `UnitOfWork` are abstract classes so Nest can use them as injection tokens.
