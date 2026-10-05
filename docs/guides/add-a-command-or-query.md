# Add a command or a query

A **command** changes state and returns little (an id, a view); a **query** reads and changes
nothing. Both live in the context's `application` layer. Example: a `ChangeName` command in identity.

1. **Command** — `application/src/commands/change-name/change-name.command.ts`, a class extending
   `Command<Result>` from `@nestjs/cqrs`, its constructor holding the input.
2. **Handler** — `change-name.handler.ts`, decorated `@CommandHandler(ChangeNameCommand)`. Inject
   ports (abstract classes from `ports/` or domain repositories), never adapters. Load the
   aggregate, call its method, save it; the rule itself belongs in the aggregate.
3. **Spec** — `change-name.handler.spec.ts`, built on `createIdentityTestKit()` (in-memory fakes,
   fixed clock). The structure check fails without it.
4. **Register** the handler in `<context>-application.module.ts` and export the command from
   `index.ts`.
5. **Expose it**, if callers outside the context need it:
   - over HTTP: request/response schemas and the route segment in `@template/contracts`, a DTO
     (`createZodDto`) and a controller method in the context's `http` layer;
   - from the web: an endpoint in `@template/api-client`, then a mutation in the feature's `api/`.
6. **Errors** — a new domain error gets a code in the context's `*.errors.ts` contract, a mapping in
   its `DomainErrorMapper`, and a translation under `errors.<CODE>` in every locale.

A query is the same with `queries/<name>/<name>.query.ts` (`Query<Result>`), `@QueryHandler`, and a
view model from `views/` as its result, never an aggregate.

Done when the handler spec covers the rule and its refusal, and `bunx nx affected -t lint typecheck test` is green.
