# @template/messaging

BullMQ inside Nest, typed end to end by the contracts of `@template/queue`.

## Layout

| Path                  | Holds                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `messaging.module.ts` | `forRoot({ connectionName, workerConcurrency?, synchroniseSchedules? })`, `registerQueues(...)`, `registerSchedules(...)` |
| `producer/`           | `JobProducer.enqueue(job, payload)`: validates, then adds to the job's queue                                              |
| `consumer/`           | `TypedProcessor` base class and `onJob(job, handler)`                                                                     |
| `scheduling/`         | `defineSchedule`, the boot-time registrar (upsert + prune) and the worker concurrency tuner                               |
| `board/`              | `createBullBoardModules({ route, queues, middleware })`                                                                   |

## Roles per runnable

| Runnable  | Uses                                                                                               |
| --------- | -------------------------------------------------------------------------------------------------- |
| api       | `forRoot` + `registerQueues` → produces jobs, mounts Bull Board                                    |
| worker    | `forRoot({ workerConcurrency })` + processors → consumes jobs                                      |
| scheduler | `forRoot({ synchroniseSchedules: true })` + `registerSchedules` → declares cron jobs, runs nothing |

## Processor example

```ts
@Processor(mailQueue.name)
export class MailProcessor extends TypedProcessor {
  protected handlers() {
    return [
      onJob(sendWelcomeEmailJob, (payload) =>
        this.commandBus.execute(new SendWelcomeEmailCommand(payload)),
      ),
    ];
  }
}
```
