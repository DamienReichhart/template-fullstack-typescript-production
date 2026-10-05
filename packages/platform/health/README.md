# @template/health

Liveness and readiness for every runnable.

| Path               | Holds                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `health.module.ts` | `forHttp({ dependencies })` (api) and `forProbe({ dependencies, config })` (worker, scheduler) |
| `controllers/`     | `GET /health/live`, `GET /health/ready` (outside `/api/v1`, not rate limited)                  |
| `indicators/`      | One indicator per dependency (`database`, `redis`), timed, never throwing                      |
| `readiness/`       | `ReadinessService`: `dependencies()` for the system ping, `check()` for probes                 |
| `probe/`           | Minimal `node:http` probe server (`/live`, `/ready`) for runnables without HTTP                |

- **Liveness** never checks dependencies: a database outage must not restart every pod.
- **Readiness** returns 503 when any dependency is down, so traffic drains instead of failing.
