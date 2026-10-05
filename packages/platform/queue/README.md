# @template/queue

Job contracts, and nothing else: queue names, job names and Zod payload schemas. No Nest,
no connections. This package is the **only** integration channel between bounded
contexts (see `docs/adr/`): identity enqueues `send-email-verification`, notifications
processes it, and neither imports the other.

## Layout

| Path                              | Holds                                                       |
| --------------------------------- | ----------------------------------------------------------- |
| `core/`                           | `defineQueue`, `defineJob`, default retry/retention options |
| `queues/<queue>/<queue>.queue.ts` | The queue definition and its option overrides               |
| `queues/<queue>/<queue>.jobs.ts`  | Every job of that queue with its payload schema             |

## Adding a job

See `docs/guides/add-a-job-or-schedule.md`. Payloads must be JSON-serialisable and
**versioned by addition**: add optional fields, never rename or remove one while old jobs
may still sit in Redis.
