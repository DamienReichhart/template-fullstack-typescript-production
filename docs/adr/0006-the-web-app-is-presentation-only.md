# The web app is presentation only

Next.js renders pages and calls the api over HTTP from the browser; it holds no business logic, no Server Actions and no Route Handlers. Its proxy reads only the session hint cookie, to redirect, never to decide what data a request may see. The api stays the single authority for rules and data, so a mobile client or a second frontend needs no logic duplicated. ESLint and `tools/scripts/check-no-server-logic.ts` (pre-commit and CI) enforce it.

## Consequences

Authenticated pages render their shell on the server and their data in the browser; anything indexable is public data or static copy.
