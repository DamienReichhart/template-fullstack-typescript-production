# @template/logger

Structured logging for every Nest runnable, built on pino (`nestjs-pino`).

| Path               | Holds                                                            |
| ------------------ | ---------------------------------------------------------------- |
| `logger.module.ts` | `LoggerModule.forRoot({ service })`, level from `LOG_LEVEL`      |
| `options/`         | pino options factory and the list of redacted paths              |
| `request-context/` | `x-request-id` propagation (reused from the caller or generated) |

- Development: pretty single-line output. Production: one JSON object per line.
- Every HTTP log line carries `requestId`; the same id is returned in the `x-request-id`
  header and in RFC 9457 error bodies.
- Health probes are not logged.
