# One Postgres database, its schema split by context

All contexts share one Postgres database and one Prisma client (`@template/database`), with one schema file per context (`prisma/schema/<context>.prisma`). Only a context's `infrastructure` layer reads or writes its tables; other contexts reference its records by id. One database keeps transactions and migrations simple at this size; per-context files keep ownership visible, so a context can move to its own database later.
