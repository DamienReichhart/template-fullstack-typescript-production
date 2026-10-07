# @template/identity-http

HTTP presentation of the identity context: controllers, DTOs, cookies and the app-wide
guards. Controllers only translate HTTP ⇄ commands/queries; no business rule lives here.

## Endpoints (`/api/v1`)

| Method & path                    | Access    | Effect                         |
| -------------------------------- | --------- | ------------------------------ |
| `GET  /auth/csrf`                | public    | Sets the readable CSRF cookie  |
| `POST /auth/register`            | public    | 201 + session cookies          |
| `POST /auth/verify-email`        | public    | 204                            |
| `POST /auth/verify-email/resend` | public    | 202 (always)                   |
| `POST /auth/login`               | public    | 200 + session cookies          |
| `POST /auth/refresh`             | cookie    | 200 + rotated cookies          |
| `POST /auth/logout`              | cookie    | 204, cookies cleared           |
| `POST /auth/password/forgot`     | public    | 202 (always)                   |
| `POST /auth/password/reset`      | public    | 204, every session revoked     |
| `GET  /me`                       | signed in | Current user                   |
| `POST /me/avatar/uploads`        | verified  | 201 + presigned upload form    |
| `PUT  /me/avatar`                | verified  | Keeps the upload; current user |
| `DELETE /me/avatar`              | signed in | Removes it; current user       |

## Layout

| Path           | Holds                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------- |
| `controllers/` | Registration, session, password, me                                                         |
| `dto/`         | `requests/` and `responses/`: `createZodDto()` over `@template/contracts` schemas           |
| `guards/`      | `CsrfGuard`, `AccessTokenGuard`, `RolesGuard`, `EmailVerifiedGuard` (global, in this order) |
| `decorators/`  | `@Public()`, `@Roles()`, `@RequireVerifiedEmail()`, `@CurrentUser()`, `@Client()`           |
| `cookies/`     | `AuthCookiesService` and cookie options (`COOKIE_DOMAIN`, `COOKIE_SECURE`)                  |
| `errors/`      | `IdentityErrorMapper`: domain errors → RFC 9457 codes                                       |
| `testing/`     | In-process app over in-memory adapters, for this package's specs                            |

## Security model

- Access token (15 min) and refresh token (30 days, rotated) in **httpOnly** cookies; the
  refresh cookie is only sent to `/api/v1/auth`.
- CSRF: double-submit cookie (`tpl_csrf`) echoed in `x-csrf-token` on every unsafe method.
- Every route is private unless decorated with `@Public()` (from `@template/http`).
