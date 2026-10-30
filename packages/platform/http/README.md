# @template/http

Everything HTTP-specific that is not business logic, shared by every HTTP runnable.

## Layout

| Path             | Holds                                                                                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `http.module.ts` | `HttpModule.forRoot()`: global error filter, Zod pipe/serializer, rate limiter                                                                                                                 |
| `bootstrap/`     | `configureHttpApp(app, meta)`: proxy, helmet, cookies, CORS, `/api/v1`, shutdown hooks, Swagger                                                                                                |
| `errors/`        | RFC 9457 `ProblemDetailsFilter`, `DomainErrorMapper` (one per context), `ApiProblemException`                                                                                                  |
| `security/`      | helmet, CORS, the Redis-backed `RateLimitGuard` (`@RateLimit()`, `@SkipRateLimit()`), and the caller: `@Public()`, `@CurrentUser()`, `@RequireVerifiedEmail()` (enforced by identity's guards) |
| `validation/`    | Global `ZodValidationPipe` and `ZodSerializerInterceptor` (nestjs-zod)                                                                                                                         |
| `openapi/`       | OpenAPI document generation and Swagger UI at `/docs` (when `SWAGGER_ENABLED=true`)                                                                                                            |

## Rules

- Controllers never build error responses: they throw. Domain errors are mapped by the
  owning context's `DomainErrorMapper`; anything unmapped becomes an opaque 500.
- DTOs are `createZodDto(schemaFromContracts)`: import `createZodDto` and `ZodResponse`
  from this package, not from `nestjs-zod`, so the validation library stays swappable.
