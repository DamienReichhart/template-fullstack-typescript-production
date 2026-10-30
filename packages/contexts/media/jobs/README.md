# @template/media-jobs

Queue consumers of the media context, run by the worker.

| Queue   | Job               | Command                 |
| ------- | ----------------- | ----------------------- |
| `media` | `transcode-video` | `TranscodeVideoCommand` |

`MediaProcessor` runs one transcode at a time per worker (`concurrency = 1`, whatever
`WORKER_CONCURRENCY` says) and tells the command whether a retry follows, so the last attempt
fails the Video instead of leaving it Processing. `transcode-video` is enqueued by the api when a
Video is uploaded (`VideoTranscoding`).
