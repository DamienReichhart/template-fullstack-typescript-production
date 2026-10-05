# Contexts integrate through queued jobs, never direct calls

A context asks another for work by enqueuing a job whose name and payload schema live in `@template/queue`; it never imports the other context. Identity requests emails this way and Notifications consumes them in the worker, so neither depends on the other, and a slow or failing email provider never slows down or fails a registration.
