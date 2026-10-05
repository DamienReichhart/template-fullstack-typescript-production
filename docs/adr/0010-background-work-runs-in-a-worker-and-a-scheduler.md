# Background work runs in a dedicated worker and a scheduler

Jobs run in the `worker` app (BullMQ consumers) and repeatable jobs are registered by the `scheduler` app; the api only enqueues. Each scales and restarts independently, and a deploy of the api never interrupts a job. Schedules are declared in code and synchronised on scheduler boot: changed ones are upserted, removed ones pruned, so the schedule in Redis is always the one in the repository.
