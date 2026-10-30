# @template/media-http

HTTP presentation of the media context. Controllers only translate HTTP ⇄ commands/queries; no
business rule lives here.

## Endpoints (`/api/v1`)

| Method & path           | Access    | Effect                                    |
| ----------------------- | --------- | ----------------------------------------- |
| `POST /videos/uploads`  | verified  | 201 + presigned upload form               |
| `POST /videos`          | verified  | 201: keeps the upload, Video `PROCESSING` |
| `GET  /videos`          | signed in | The caller's Videos, newest first         |
| `GET  /videos/:videoId` | signed in | One of them (404 for anyone else's)       |

## Layout

| Path           | Holds                                                                                |
| -------------- | ------------------------------------------------------------------------------------ |
| `controllers/` | `VideosController`                                                                   |
| `dto/`         | `requests/` and `responses/`: `createZodDto()` over `@template/contracts/media`      |
| `errors/`      | `MediaErrorMapper`: domain errors → RFC 9457 codes                                   |
| `testing/`     | In-process app over in-memory adapters, the caller set from headers, for these specs |

Authentication is the app's: `@CurrentUser()` and `@RequireVerifiedEmail()` come from
`@template/http` and are enforced by identity's global guards.
