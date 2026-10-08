# @template/api-client

Typed HTTP client for the API, framework-agnostic (no React, no Next). Every frontend
(the web app today, an admin app tomorrow) talks to the API through it.

## Layout

| Path                            | Holds                                                              |
| ------------------------------- | ------------------------------------------------------------------ |
| `core/http-client.ts`           | `HttpClient`: cookies, CSRF header, refresh-on-401, `ApiError`     |
| `core/api-error.ts`             | `ApiError`: status, stable `code`, field errors, request id        |
| `core/csrf.ts`                  | CSRF token from its cookie, fetched once when missing              |
| `core/refresh-coordinator.ts`   | Single-flight session refresh                                      |
| `core/storage-upload.ts`        | `uploadToStorage(ticket, file)`: presigned form POST to the bucket |
| `endpoints/<area>.endpoints.ts` | One factory per `@template/contracts` area (`identity`, `system`)  |

## Behaviour

- `credentials: 'include'` on every call; the CSRF header on every unsafe method.
- A 401 triggers **one** refresh (shared by concurrent calls) then **one** retry, only when
  the session hint cookie exists. Auth endpoints opt out (`refreshOnUnauthorized: false`).
- A `SESSION_REFRESH_CONFLICT` (another tab refreshed first) counts as a successful refresh.
- Responses are validated with the contract schemas; failures always throw `ApiError`.
- Files go to object storage directly (`uploadToStorage`), never through the api, and without
  credentials: the bucket is another origin. A refusal is `ApiError` `UPLOAD_FAILED`.
