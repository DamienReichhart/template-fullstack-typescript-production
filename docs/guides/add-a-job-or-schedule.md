# Add a job or a schedule

Jobs are how work leaves the request ([ADR 0010](../adr/0010-background-work-runs-in-a-worker-and-a-scheduler.md))
and how contexts ask each other for work ([ADR 0005](../adr/0005-contexts-integrate-through-queued-jobs.md)).

## A job

1. **Contract** — in `packages/platform/queue/src/queues/<queue>/<queue>.jobs.ts`, add
   `defineJob(queue, 'job-name', zodSchema, options?)` and export it from the package index.
   Payloads are JSON: ids, strings, ISO dates; never an aggregate. A new queue gets its own folder
   with `<queue>.queue.ts` (`defineQueue('queue-name')`).
2. **Producer** — the producing context's `infrastructure` implements an application port by calling
   `JobProducer.enqueue(job, payload)`; its module registers the queue with
   `MessagingModule.registerQueues(queue)`. The payload is validated before it is enqueued.
3. **Consumer** — the consuming context's `jobs` layer: a processor extending `TypedProcessor`, with
   `@Processor(queue.name)` and one `onJob(job, handler)` per job. The handler dispatches an
   application command; it holds no logic. An unknown job or an invalid payload fails without retry.
4. **Wire** the jobs module into `apps/worker/src/modules/<context>/` (it receives the application
   module through `register({ application })`), and add the queue to Bull Board in
   `apps/api/src/modules/admin/admin.module.ts`.

## A schedule

1. Declare it with `defineSchedule({ id, job, pattern, timezone, payload })` in
   `apps/scheduler/src/modules/<context>/schedules/<queue>.schedules.ts`, and pass the list to
   `MessagingModule.registerSchedules(...)` in that module. The id is stable: renaming it creates a
   new schedule and prunes the old one on the next scheduler boot.
2. The schedules spec checks payloads against their job schemas and ids for uniqueness: extend it.

Done when a processor spec covers the dispatch and the worker logs the job as completed locally
(`bunx nx dev worker`).
