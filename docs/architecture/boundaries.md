# Boundaries

`@nx/enforce-module-boundaries` turns the architecture into lint errors. The rules live in
[`eslint.config.mjs`](../../eslint.config.mjs); this page explains why each one exists and what
to do when one fires. Every project carries a `scope:*` tag and a `type:*` or `layer:*` tag in
its `package.json`.

## Scopes: who may talk to whom

| Scope                  | May depend on                    | Why                                                                                                                             |
| ---------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `scope:shared`         | `scope:shared`                   | Contracts and messages are read by the browser and by Nest: they import neither.                                                |
| `scope:platform`       | `scope:platform`, `scope:shared` | Technical building blocks know no business context, so every context can use them.                                              |
| `scope:<context>`      | itself, `platform`, `shared`     | A context never imports another context ([ADR 0005](../adr/0005-contexts-integrate-through-queued-jobs.md)): it enqueues a job. |
| `scope:frontend`       | `scope:frontend`, `scope:shared` | The web app reaches the backend over HTTP only ([ADR 0006](../adr/0006-the-web-app-is-presentation-only.md)).                   |
| `type:app`, `type:e2e` | anything but apps and e2e suites | Runnables compose libraries; one app importing another would couple their deploys.                                              |

## Layers inside a context

| Layer                  | May depend on                         | Holds                                                                 |
| ---------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| `layer:domain`         | domain, `@template/ddd`               | Aggregates, value objects, domain events and errors. No framework.    |
| `layer:application`    | domain, application, `@template/ddd`  | Commands, queries, event handlers, and ports (abstract classes).      |
| `layer:infrastructure` | domain, application, platform, shared | Adapters implementing the ports: Prisma, argon2, JWT, BullMQ, Resend. |
| `layer:http`           | domain, application, platform, shared | Controllers, DTOs from contracts, guards, the context's error mapper. |
| `layer:jobs`           | application, platform, shared         | Queue processors that turn a job into a command.                      |

Dependencies point inward, toward `domain`. Infrastructure is wired in by the runnable, never
imported by `application`: `XApplicationModule.register({ infrastructure })` receives the adapters
([ADR 0004](../adr/0004-bounded-contexts-are-split-into-layer-packages.md)).

## When the rule fires

The error names the two tags that may not meet. Ask which way the dependency should point:

- **Domain needs a library**: model the need as a port in `application`, implement it in `infrastructure`.
- **Application needs files**: a port named after the domain (`AvatarStorage`), implemented over
  `ObjectStorage` in `infrastructure`; the application layer never imports `@template/storage`.
- **Two contexts need each other**: one enqueues a job the other consumes; define it in `@template/queue`.
- **The web app needs a backend type**: put the shape in `@template/contracts`, which both sides import.
- **A platform package needs a context**: the code belongs in the context, or the context passes it in.

Silencing the rule with a comment is never the answer: it turns a design question into debt.

`banTransitiveDependencies` is on as well: import a package only if your `package.json` declares it.
