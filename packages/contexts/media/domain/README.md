# @template/media-domain

The media model: what a Video is and how it settles. Pure TypeScript, depends only on
`@template/ddd`. Vocabulary: [`../GLOSSARY.md`](../GLOSSARY.md).

## Aggregates

| Aggregate | Invariants it protects                                                                                      |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| `Video`   | Starts Processing; settles once, Ready with its Playable file or Failed with a reason; belongs to one Owner |

| Value object   | Rule                                                               |
| -------------- | ------------------------------------------------------------------ |
| `VideoFile`    | What may be uploaded: MP4 or MOV, 2 GB at most                     |
| `SourceVideo`  | What may be transcoded: a video stream, ten minutes at most        |
| `PlayableFile` | The file a Ready Video plays from: key, size, dimensions, duration |

The aggregate folder holds `video.aggregate.ts`, `value-objects/`, `events/`, `errors/` and
`repositories/` (ports implemented by `@template/media-infrastructure`).
