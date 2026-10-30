# @template/media-application

The media use cases, as CQRS commands, queries and event handlers. Depends on the domain and on
**ports** (abstract classes) that `@template/media-infrastructure` implements.

## Layout

| Path                      | Holds                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| `commands/<name>/`        | `<name>.command.ts` · `<name>.handler.ts` · `<name>.handler.spec.ts`                                |
| `queries/<name>/`         | `<name>.query.ts` · `<name>.handler.ts` · `<name>.handler.spec.ts`                                  |
| `event-handlers/<event>/` | Policies reacting to a domain event (schedule Transcoding)                                          |
| `ports/<concern>/`        | `storage/` (`VideoStorage`), `transcoding/` (`VideoTranscoder`), `processing/` (`VideoTranscoding`) |
| `services/`               | `VideoViews`: a Video as its Owner sees it, playback URL included                                   |
| `views/`                  | Read models returned to presentation layers                                                         |
| `testing/`                | In-memory repository, fakes and `createMediaTestKit()`: `@template/media-application/testing`       |

## Use cases

| Command / query             | Effect                                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| `RequestVideoUploadCommand` | Checks the announced file (`VideoFile`), returns a presigned upload form                              |
| `UploadVideoCommand`        | Keeps the checked upload as the Source of a Processing Video; Transcoding follows via `VideoUploaded` |
| `TranscodeVideoCommand`     | Transcodes, settles the Video (Ready or Failed), deletes the Source (worker, `transcode-video`)       |
| `GetVideoQuery`             | One Video of its Owner                                                                                |
| `ListVideosQuery`           | The Owner's Videos, newest first                                                                      |

## Wiring

```ts
MediaApplicationModule.register({ infrastructure: MediaInfrastructureModule.forRoot() });
```

The infrastructure module is passed in, so this layer never imports it.
