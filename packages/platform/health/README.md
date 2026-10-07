# @template/health

Liveness and readiness for every runnable.

| Path               | Holds                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| `health.module.ts` | `forHttp({ dependencies, reported })` (api), `forProbe({ dependencies, reported, config })`     |
| `controllers/`     | `GET /health/live`, `GET /health/ready` (outside `/api/v1`, not rate limited)                   |
| `indicators/`      | One indicator per dependency (`database`, `redis`, `storage`), timed, never throwing            |
| `readiness/`       | `ReadinessService`: `dependencies()` for the system ping, `required()` and `check()` for probes |
| `probe/`           | Minimal `node:http` probe server (`/live`, `/ready`) for runnables without HTTP                 |

- **Liveness** never checks dependencies: a database outage must not restart every pod.
- **Readiness** returns 503 when a required dependency is down, so traffic drains instead of failing.
- **Reported** dependencies (`reported: ['storage']`) show in the system ping but never fail
  readiness: object storage being down breaks uploads, not sign-in, so it must not drain the api.
