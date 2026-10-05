# scheduler

Declares recurring jobs and nothing else. On boot it synchronises the declared schedules with
Redis (BullMQ job schedulers: upsert each, remove the ones no longer declared); BullMQ then
enqueues every occurrence and the **worker** runs it. The scheduler never executes a job and
never touches the database.

## Layout

```
src/
├── main.ts               bootstrap
├── scheduler.module.ts   imports every module below
└── modules/<name>/       <name>.module.ts (+ schedules/ for contexts)
```

| Module      | Provides                                              |
| ----------- | ----------------------------------------------------- |
| `config`    | Validated env: app, Redis, `SCHEDULER_HEALTH_PORT`    |
| `logger`    | pino, `service=scheduler`                             |
| `redis`     | Shared client (readiness probe)                       |
| `messaging` | Schedule registrar                                    |
| `health`    | Probe server: `/live`, `/ready`                       |
| `identity`  | `identity:purge-expired-sessions`, daily at 03:00 UTC |

## Adding a schedule

Add a `defineSchedule({ id, job, pattern, payload })` to the context's
`schedules/<queue>.schedules.ts`. Keep ids stable: a renamed id is a new schedule (the old
one is pruned on the next boot). See `docs/guides/add-a-job-or-schedule.md`.

Running several replicas is safe: synchronisation is idempotent.
